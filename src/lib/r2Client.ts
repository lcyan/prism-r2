import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

export interface R2Config {
  id: string;
  name: string;
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  customDomain?: string;
  endpoint?: string;
  isDefault?: boolean;
}

export class R2Manager {
  private client: S3Client | null = null;
  private config: R2Config | null = null;

  constructor(config?: R2Config) {
    if (config) {
      this.init(config);
    }
  }

  init(config: R2Config) {
    this.config = config;
    const accountId = config.accountId.trim();
    const endpoint = config.endpoint?.trim() || `https://${accountId}.r2.cloudflarestorage.com`;

    if (import.meta.env.DEV) {
      console.log(`[R2] Initializing with endpoint: ${endpoint}, bucket: ${config.bucketName}`);
    }

    this.client = new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId: config.accessKeyId.trim(),
        secretAccessKey: config.secretAccessKey.trim(),
      },
      // Cloudflare R2 works best with virtual-hosted style on account-level endpoints
      forcePathStyle: true,
    });
  }

  async listFiles(prefix: string = "", recursive: boolean = true, maxKeys: number = 1000, continuationToken?: string) {
    if (!this.client || !this.config) throw new Error("R2 not initialized");

    const command = new ListObjectsV2Command({
      Bucket: this.config.bucketName,
      Prefix: prefix,
      Delimiter: recursive ? undefined : "/",
      MaxKeys: maxKeys,
      ContinuationToken: continuationToken,
    });

    const response = await this.client.send(command);
    return response;
  }

  async uploadFile(file: File, path: string, onProgress?: (progress: number, speed: number) => void) {
    if (!this.client || !this.config) throw new Error("R2 not initialized");

    // 生成年月日时分秒毫秒格式的文件名
    const now = new Date();
    const timestamp = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0') +
      now.getMilliseconds().toString().padStart(3, '0');
    
    const extension = file.name.includes('.') ? `.${file.name.split('.').pop()}` : '';
    const newFileName = `${timestamp}${extension}`;

    const normalizedPath = path.replace(/\/$/, "");
    const fullPath = normalizedPath ? `${normalizedPath}/${newFileName}` : newFileName;
    const startTime = Date.now();

    const parallelUploads3 = new Upload({
      client: this.client,
      params: {
        Bucket: this.config.bucketName,
        Key: fullPath,
        Body: file,
        ContentType: file.type,
      },
      queueSize: 4,
      partSize: 1024 * 1024 * 5, // 5MB
      leavePartsOnError: false,
    });

    parallelUploads3.on("httpUploadProgress", (progress) => {
      if (progress.loaded && progress.total && onProgress) {
        const percent = Math.round((progress.loaded / progress.total) * 100);
        const duration = (Date.now() - startTime) / 1000;
        const speed = progress.loaded / duration; // bytes per second
        onProgress(percent, speed);
      }
    });

    return await parallelUploads3.done();
  }

  async deleteFile(key: string) {
    if (!this.client || !this.config) throw new Error("R2 not initialized");

    const command = new DeleteObjectCommand({
      Bucket: this.config.bucketName,
      Key: key,
    });

    return await this.client.send(command);
  }

  getPublicUrl(key: string) {
    if (!this.config) return "";
    if (this.config.customDomain) {
      return `${this.config.customDomain.replace(/\/$/, "")}/${key}`;
    }
    // Fallback or Dev URL logic can be added here
    return `https://${this.config.bucketName}.${this.config.accountId}.r2.cloudflarestorage.com/${key}`;
  }
  // Cloud Sync methods (Environment Variables)
  async syncFromCloud() {
    const response = await fetch('/api/configs', {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch from Cloud');
    return await response.json();
  }

  async syncToCloud(configs: R2Config[]) {
    const response = await fetch('/api/configs', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configs)
    });

    if (!response.ok) {
      const error = await response.json() as any;
      throw new Error(error.error || 'Failed to save to Cloud');
    }
    return await response.json();
  }
}

export const r2Manager = new R2Manager();
