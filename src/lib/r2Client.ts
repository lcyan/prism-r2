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

    console.log(`[R2] Initializing with endpoint: ${endpoint}, bucket: ${config.bucketName}`);

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

  async listFiles(prefix: string = "", recursive: boolean = true) {
    if (!this.client || !this.config) throw new Error("R2 not initialized");

    const command = new ListObjectsV2Command({
      Bucket: this.config.bucketName,
      Prefix: prefix,
      Delimiter: recursive ? undefined : "/",
    });

    const response = await this.client.send(command);
    return response;
  }

  async uploadFile(file: File, path: string, onProgress?: (progress: number, speed: number) => void) {
    if (!this.client || !this.config) throw new Error("R2 not initialized");

    const fullPath = path ? `${path}/${file.name}` : file.name;
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
  // KV Sync methods (Serverless)
  async syncFromKV(authToken: string = "") {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    // Use relative path which works both in dev (with proxy) and prod
    const response = await fetch('/api/configs', { headers });
    if (!response.ok) throw new Error('Failed to fetch from KV');
    return await response.json();
  }

  async syncToKV(configs: R2Config[], authToken: string = "") {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const response = await fetch('/api/configs', {
      method: 'POST',
      headers,
      body: JSON.stringify(configs)
    });

    if (!response.ok) throw new Error('Failed to save to KV');
    return await response.json();
  }
}

export const r2Manager = new R2Manager();
