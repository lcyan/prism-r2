import React, { useState, useMemo, useCallback } from "react";
import {
  Search,
  Grid as GridIcon,
  List,
  Download,
  Trash2,
  File as FileIcon,
  Check,
  Eye,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Database,
  Link,
  Code,
  FileText,
  Type,
  ArrowUpDown,
} from "lucide-react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Heading,
  IconButton,
  Input,
  Button,
  Center,
  SimpleGrid,
  Badge,
  Portal,
  Image,
  Separator,
  Container,
  Skeleton,
  Table,
  Spinner,
} from "@chakra-ui/react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import type { R2File } from "../../types";
import { formatSize } from "../../types";
import { format } from "date-fns";
import { FilePreview } from "./FilePreview";
import { motion, AnimatePresence } from "framer-motion";
import { toaster } from '../../components/ui/toaster';

const MotionBox = motion(Box);
const columnHelper = createColumnHelper<R2File>();

interface DashboardProps {
  files: R2File[];
  directories: string[];
  onRefresh: () => void;
  onDelete: (key: string) => void;
  onDownload: (file: R2File) => void;
  onCopyLink: (file: R2File) => void;
  publicUrlGetter: (key: string) => string;
  onBulkDelete: (keys: string[]) => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  isLoading?: boolean;
}

type CopyFormat = "url" | "html" | "markdown" | "bbcode";

const ACTIVE_COLORS: Record<CopyFormat, string> = {
  url: "blue",
  html: "yellow",
  markdown: "green",
  bbcode: "pink",
};

const isImage = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "webp", "svg", "avif"].includes(
    ext || ""
  );
};

interface FileCardProps {
  file: R2File;
  activeFormat: CopyFormat;
  currentUrl: string;
  isSelected: boolean;
  onToggleSelect: (key: string) => void;
  onDelete: (key: string) => void;
  onPreview: (file: R2File) => void;
  onCopy: (url: string, format: CopyFormat) => void;
  onFormatChange: (format: CopyFormat) => void;
  getFormattedLink: (url: string, format: CopyFormat) => string;
}

const FileCard = React.memo(
  ({
    file,
    activeFormat,
    currentUrl,
    isSelected,
    onToggleSelect,
    onDelete,
    onPreview,
    onCopy,
    onFormatChange,
    getFormattedLink,
  }: FileCardProps) => {
    const [imageLoaded, setImageLoaded] = React.useState(false);
    const [imageError, setImageError] = React.useState(false);
    const [isCopied, setIsCopied] = React.useState(false);

    const handleCopyClick = (e: React.MouseEvent) => {
        const input = e.target as HTMLInputElement;
        input.select();
        onCopy(currentUrl, activeFormat);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Box
          bg={{ base: "whiteAlpha.700", _dark: "whiteAlpha.50" }}
          backdropFilter="blur(20px)"
          borderRadius="3xl"
          p={5}
          shadow="sm"
          borderWidth="1px"
          borderColor={{ base: "whiteAlpha.400", _dark: "whiteAlpha.100" }}
          transition="all 0.3s"
          _hover={{ shadow: "xl", transform: "translateY(-4px)" }}
          position="relative"
          overflow="hidden"
        >
          {/* Thumbnail Container */}
          <Box
            aspectRatio={16 / 9}
            borderRadius="2xl"
            bg={{ base: "whiteAlpha.600", _dark: "whiteAlpha.50" }}
            backdropFilter="blur(10px)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
            overflow="hidden"
            mb={4}
          >
            {isImage(file.name) ? (
              <>
                {/* 占位符/加载状态 */}
                {!imageLoaded && !imageError && (
                  <Box
                    position="absolute"
                    inset={0}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg="gray.100"
                    _dark={{ bg: "gray.800" }}
                  >
                    <VStack gap={2}>
                      <Spinner size="lg" color="blue.500" />
                      <Text fontSize="xs" color="gray.500" fontWeight="medium">
                        加载中...
                      </Text>
                    </VStack>
                  </Box>
                )}

                {/* 加载失败状态 */}
                {imageError && (
                  <Box
                    position="absolute"
                    inset={0}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg="gray.100"
                    _dark={{ bg: "gray.800" }}
                  >
                    <VStack gap={2}>
                      <FileIcon size={48} style={{ opacity: 0.3 }} />
                      <Text fontSize="xs" color="gray.500" fontWeight="medium">
                        加载失败
                      </Text>
                    </VStack>
                  </Box>
                )}

                <Image
                  src={currentUrl}
                  alt={file.name}
                  w="full"
                  h="full"
                  objectFit="cover"
                  cursor="pointer"
                  transition="transform 0.5s"
                  _hover={{ transform: "scale(1.1)" }}
                  onClick={() => onPreview(file)}
                  loading="lazy"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  opacity={imageLoaded ? 1 : 0}
                />
              </>
            ) : (
              <FileIcon size={48} style={{ opacity: 0.6 }} />
            )}

            {/* Overlays */}
            <IconButton
              aria-label="Select file"
              position="absolute"
              top={3}
              left={3}
              size="sm"
              rounded="xl"
              variant={isSelected ? "solid" : "ghost"}
              colorPalette={isSelected ? "blue" : "blackAlpha"}
              bg={isSelected ? "blue.500" : "blackAlpha.400"}
              color="white"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(file.key);
              }}
              _hover={{ bg: isSelected ? "blue.600" : "blackAlpha.600" }}
            >
              <Check size={16} />
            </IconButton>

            <IconButton
              aria-label="Delete file"
              position="absolute"
              top={3}
              right={3}
              size="sm"
              rounded="full"
              colorPalette="red"
              bg="red.500"
              color="white"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(file.key);
              }}
              _hover={{ bg: "red.600", transform: "scale(1.1)" }}
            >
              <Trash2 size={16} />
            </IconButton>
          </Box>

          {/* Info Section */}
          <VStack align="stretch" gap={1} mb={4} px={1}>
            <Text fontWeight="semibold" fontSize="md" truncate title={file.key} color={{ base: "gray.800", _dark: "white" }}>
              {file.name}
            </Text>
            <Flex justify="space-between" align="center">
              <Text
                fontSize="2xs"
                fontWeight="medium"
                color="gray.400"
                letterSpacing="wider"
              >
                {file.lastModified
                  ? format(new Date(file.lastModified), "yyyy.MM.dd")
                  : "-"}
              </Text>
              <Badge
                variant="subtle"
                colorPalette="blue"
                fontSize="2xs"
                fontWeight="medium"
              >
                {formatSize(file.size)}
              </Badge>
            </Flex>
          </VStack>

          {/* Code Input Box */}
          <Box mb={4}>
                    <Input
                        readOnly
                        value={getFormattedLink(currentUrl, activeFormat)}
                        size="sm"
                        fontSize="2xs"
                        fontWeight="normal"
                        borderRadius="xl"
                        bg={isCopied ? "green.500/10" : { base: "whiteAlpha.600", _dark: "whiteAlpha.50" }}
                        color={isCopied ? "green.600" : "inherit"}
                        backdropFilter="blur(10px)"
                        border={isCopied ? "1px solid" : "none"}
                        borderColor="green.500/30"
                        _hover={{ bg: isCopied ? "green.500/15" : { base: 'whiteAlpha.800', _dark: 'whiteAlpha.100' } }}
                        cursor="pointer"
                        onClick={handleCopyClick}
                        transition="all 0.2s"
                    />
</Box>

          {/* Actions Row */}
          <HStack
            bg={{ base: "whiteAlpha.600", _dark: "whiteAlpha.50" }}
            backdropFilter="blur(10px)"
            p={1}
            borderRadius="2xl"
            gap={1}
            position="relative"
          >
            {/* 动画滑块背景 */}
            <MotionBox
              layoutId={`format-indicator-${file.key}`}
              position="absolute"
              h="8"
              borderRadius="xl"
              bg={`${ACTIVE_COLORS[activeFormat]}.500`}
              shadow="md"
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
              style={{
                width: "calc(25% - 3px)",
                left: `calc(${["url", "html", "markdown", "bbcode"].indexOf(
                  activeFormat
                )} * 25% + 4px)`,
              }}
            />
            {(["url", "html", "markdown", "bbcode"] as const).map((fmt) => {
              const Icon = {
                url: Link,
                html: Code,
                markdown: FileText,
                bbcode: Type,
              }[fmt];
              const isActive = activeFormat === fmt;

              return (
                <Button
                  key={fmt}
                  flex={1}
                  size="xs"
                  variant="ghost"
                  onClick={() => onFormatChange(fmt)}
                  borderRadius="xl"
                  h="8"
                  title={fmt.toUpperCase()}
                  color={isActive ? "white" : "fg.muted"}
                  bg="transparent"
                  position="relative"
                  zIndex={1}
                  _hover={{
                    bg: isActive ? "transparent" : "whiteAlpha.300",
                    color: isActive ? "white" : "fg",
                  }}
                  transition="color 0.2s"
                >
                  <Icon size={14} />
                </Button>
              );
            })}
          </HStack>
        </Box>
      </MotionBox>
    );
  }
);

export const Dashboard = React.memo(
  ({
    files,
    directories,
    onRefresh,
    onDelete,
    onDownload,
    onCopyLink,
    publicUrlGetter,
    onBulkDelete,
    hasMore,
    onLoadMore,
    isLoadingMore,
    isLoading = false,
  }: DashboardProps) => {
    const { t } = useTranslation();
    const [activeDirectory, setActiveDirectory] = useState("ROOT");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [sorting, setSorting] = useState<SortingState>([]);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [previewFile, setPreviewFile] = useState<R2File | null>(null);
    const [globalFormat, setGlobalFormat] = useState<CopyFormat>("url");
    const [currentPage, setCurrentPage] = useState(1);
    const [isDirectorySwitching, setIsDirectorySwitching] = useState(false);
    const itemsPerPage = 20;

    const columns = useMemo(
      () => [
        columnHelper.accessor("key", {
          header: () => t("common.name"),
          cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("size", {
          header: () => t("common.size"),
          cell: (info) => formatSize(info.getValue()),
        }),
        columnHelper.accessor("lastModified", {
          header: () => t("common.date"),
          cell: (info) => {
            const val = info.getValue();
            return val ? format(new Date(val), "yyyy-MM-dd HH:mm") : "-";
          },
        }),
      ],
      [t]
    );

    const filteredFiles = useMemo(() => {
      return files.filter((file) => {
        const isRoot = activeDirectory === "ROOT";
        const dirMatch = isRoot || file.key.startsWith(activeDirectory + "/");
        const searchMatch = searchQuery
          ? file.name.toLowerCase().includes(searchQuery.toLowerCase())
          : true;
        return dirMatch && searchMatch;
      });
    }, [files, activeDirectory, searchQuery]);

    const table = useReactTable({
      data: filteredFiles,
      columns,
      state: {
        sorting,
      },
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
    });

    const handleDirectoryChange = useCallback((dir: string) => {
      setIsDirectorySwitching(true);
      setActiveDirectory(dir);
      setCurrentPage(1);
      setSelectedKeys([]);
      setSearchQuery(""); // 清空搜索避免混淆
      // 使用 requestAnimationFrame 确保状态更新后立即清除加载状态
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsDirectorySwitching(false);
        });
      });
    }, []);

    const handleSearchChange = useCallback((query: string) => {
      setSearchQuery(query);
      setCurrentPage(1);
    }, []);

    const getFormattedLink = useCallback((url: string, format: CopyFormat) => {
      switch (format) {
        case "html":
          return `<img src="${url}" alt="image">`;
        case "markdown":
          return `![image](${url})`;
        case "bbcode":
          return `[img]${url}[/img]`;
        default:
          return url;
      }
    }, []);

    const handleCopy = useCallback((url: string, format: CopyFormat) => {
        const text = getFormattedLink(url, format);
        navigator.clipboard.writeText(text);
        toaster.create({
            title: '复制成功',
            type: 'success',
            duration: 2000,
        });
    }, [getFormattedLink]);

    const sortedFiles = useMemo(() => {
      const rows = table.getSortedRowModel().rows;
      return rows.map((row) => row.original);
    }, [table.getSortedRowModel()]);

    const totalPages = Math.ceil(sortedFiles.length / itemsPerPage);
    const paginatedFiles = useMemo(() => {
      const start = (currentPage - 1) * itemsPerPage;
      return sortedFiles.slice(start, start + itemsPerPage);
    }, [sortedFiles, currentPage, itemsPerPage]);

    const toggleSelect = useCallback((key: string) => {
      setSelectedKeys((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
    }, []);

    const selectAll = () => {
      if (
        selectedKeys.length === paginatedFiles.length &&
        paginatedFiles.length > 0
      ) {
        setSelectedKeys([]);
      } else {
        setSelectedKeys(paginatedFiles.map((f) => f.key));
      }
    };

    return (
      <Container maxW="container.xl" py={8}>
        <VStack gap={8} align="stretch">
          {/* Header Card */}
          <Box
            bg={{ base: "whiteAlpha.700", _dark: "whiteAlpha.50" }}
            backdropFilter="blur(20px)"
            borderRadius="3xl"
            p={{ base: 6, md: 8 }}
            shadow="sm"
            borderWidth="1px"
            borderColor={{ base: "whiteAlpha.400", _dark: "whiteAlpha.100" }}
          >
            <Flex
              direction={{ base: "column", lg: "row" }}
              justify="space-between"
              align={{ base: "stretch", lg: "center" }}
              gap={6}
            >
              <HStack gap={5}>
                <Center
                  w={{ base: 12, md: 14 }}
                  h={{ base: 12, md: 14 }}
                  borderRadius="2xl"
                  bgGradient="to-br"
                  gradientFrom="blue.500"
                  gradientTo="blue.700"
                  shadow="lg"
                  color="white"
                >
                  <Database size={24} />
                </Center>
                <VStack align="start" gap={0}>
                  <Heading 
                    size="xl" 
                    fontWeight="black" 
                    letterSpacing="tighter"
                    bgGradient="to-br"
                    gradientFrom="blue.500"
                    gradientTo="purple.600"
                    bgClip="text"
                  >
                    {t("dashboard.title")}
                  </Heading>
                  <Text
                    fontSize="2xs"
                    fontWeight="bold"
                    color="fg.muted"
                    letterSpacing="widest"
                    textTransform="uppercase"
                  >
                    All Assets Library
                  </Text>
                </VStack>
              </HStack>

              <HStack gap={4} flexWrap="wrap">
                <Box
                  position="relative"
                  flex={{ base: 1, md: "none" }}
                  minW="200px"
                >
                  <Center
                    position="absolute"
                    left={4}
                    top="50%"
                    transform="translateY(-50%)"
                    color="fg.muted"
                    zIndex={1}
                  >
                    <Search size={16} />
                  </Center>
                  <Input
                    pl={12}
                    bg={{ base: "whiteAlpha.600", _dark: "whiteAlpha.50" }}
                    backdropFilter="blur(10px)"
                    border="none"
                    borderRadius="2xl"
                    placeholder={t("common.search")}
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    _focus={{
                      bg: { base: "whiteAlpha.800", _dark: "whiteAlpha.100" },
                      shadow: "outline",
                    }}
                  />
                </Box>

                <HStack
                  bg={{ base: "whiteAlpha.600", _dark: "whiteAlpha.50" }}
                  backdropFilter="blur(10px)"
                  p={1}
                  borderRadius="2xl"
                  gap={1}
                >
                  <IconButton
                    aria-label="List view"
                    size="sm"
                    variant={viewMode === "list" ? "solid" : "ghost"}
                    onClick={() => setViewMode("list")}
                    borderRadius="xl"
                  >
                    <List size={18} />
                  </IconButton>
                  <IconButton
                    aria-label="Grid view"
                    size="sm"
                    variant={viewMode === "grid" ? "solid" : "ghost"}
                    onClick={() => setViewMode("grid")}
                    borderRadius="xl"
                  >
                    <GridIcon size={18} />
                  </IconButton>
                </HStack>

                <IconButton
                  aria-label="Refresh"
                  variant="outline"
                  borderRadius="2xl"
                  onClick={() => {
                    onRefresh();
                    setSelectedKeys([]);
                  }}
                >
                  <RotateCw size={18} />
                </IconButton>
              </HStack>
            </Flex>

            <Separator my={6} />

            {/* Directory & Sort Controls */}
            <VStack align="stretch" gap={3}>
              <Flex align="center" gap={2} px={1}>
                <Text
                  fontSize="2xs"
                  fontWeight="black"
                  color="fg.muted"
                  letterSpacing="widest"
                  textTransform="uppercase"
                  opacity={0.6}
                >
                  {t("dashboard.directories") || "Categories"}
                </Text>
                <Box
                  h="1px"
                  flex={1}
                  bgGradient="to-r"
                  gradientFrom="border.subtle"
                  gradientTo="transparent"
                />
              </Flex>

              <Flex justify="space-between" align="center" gap={4}>
                <HStack
                  gap={2}
                  flex={1}
                  overflowX="auto"
                  py={1}
                  css={{
                    "&::-webkit-scrollbar": { display: "none" },
                    "-ms-overflow-style": "none",
                    "scrollbar-width": "none",
                  }}
                >
                  <Button
                    size="xs"
                    variant={activeDirectory === "ROOT" ? "solid" : "subtle"}
                    colorPalette="blue"
                    borderRadius="full"
                    px={4}
                    onClick={() => handleDirectoryChange("ROOT")}
                    flexShrink={0}
                    fontWeight="bold"
                    shadow={activeDirectory === "ROOT" ? "sm" : "none"}
                    loading={isDirectorySwitching && activeDirectory === "ROOT"}
                  >
                    全部
                  </Button>
                  {useMemo(
                    () =>
                      directories.map((dir) => (
                        <Button
                          key={dir}
                          size="xs"
                          variant={activeDirectory === dir ? "solid" : "subtle"}
                          colorPalette="blue"
                          borderRadius="full"
                          px={4}
                          onClick={() => handleDirectoryChange(dir)}
                          flexShrink={0}
                          shadow={activeDirectory === dir ? "sm" : "none"}
                          loading={
                            isDirectorySwitching && activeDirectory === dir
                          }
                        >
                          {dir}
                        </Button>
                      )),
                    [
                      directories,
                      activeDirectory,
                      handleDirectoryChange,
                      isDirectorySwitching,
                    ]
                  )}
                </HStack>

                <HStack gap={2} flexShrink={0}>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() =>
                      setSorting([
                        {
                          id: "lastModified",
                          desc:
                            sorting[0]?.id === "lastModified"
                              ? !sorting[0].desc
                              : true,
                        },
                      ])
                    }
                    borderRadius="full"
                    fontSize="2xs"
                    fontWeight="bold"
                    color="fg.muted"
                  >
                    {t("common.date")}{" "}
                    <ArrowUpDown size={10} style={{ marginLeft: "4px" }} />
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() =>
                      setSorting([
                        {
                          id: "key",
                          desc:
                            sorting[0]?.id === "key" ? !sorting[0].desc : false,
                        },
                      ])
                    }
                    borderRadius="full"
                    fontSize="2xs"
                    fontWeight="bold"
                    color="fg.muted"
                  >
                    {t("common.name")}{" "}
                    <ArrowUpDown size={10} style={{ marginLeft: "4px" }} />
                  </Button>
                </HStack>
              </Flex>
            </VStack>
          </Box>

          {/* Selection Toolbar */}
          <AnimatePresence>
            {selectedKeys.length > 0 && (
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <HStack
                  bg="blue.500"
                  color="white"
                  p={4}
                  borderRadius="2xl"
                  justify="space-between"
                  shadow="lg"
                >
                  <HStack gap={4}>
                    <Text fontWeight="bold" fontSize="sm">
                      {t("dashboard.selectedCount", {
                        count: selectedKeys.length,
                      })}
                    </Text>
                    <Button size="xs" variant="subtle" onClick={selectAll}>
                      {selectedKeys.length === paginatedFiles.length
                        ? t("dashboard.deselectAll")
                        : t("dashboard.selectAll")}
                    </Button>
                  </HStack>
                  <HStack gap={2}>
                    <Button
                      size="sm"
                      colorPalette="red"
                      bg="white"
                      color="red.500"
                      _hover={{ bg: "red.50" }}
                      onClick={() => {
                        if (
                          confirm(
                            t("common.bulkDeleteConfirm", {
                              count: selectedKeys.length,
                            })
                          )
                        ) {
                          onBulkDelete(selectedKeys);
                          setSelectedKeys([]);
                        }
                      }}
                    >
                      <Trash2 size={16} style={{ marginRight: "8px" }} />{" "}
                      {t("dashboard.bulkDelete")}
                    </Button>
                    <IconButton
                      aria-label="Close"
                      variant="ghost"
                      color="white"
                      onClick={() => setSelectedKeys([])}
                    >
                      <Check size={18} />
                    </IconButton>
                  </HStack>
                </HStack>
              </MotionBox>
            )}
          </AnimatePresence>

          {/* Files Grid/List */}
          {isLoading ? (
            <SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} gap={8}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} h="200px" borderRadius="3xl" />
              ))}
            </SimpleGrid>
          ) : paginatedFiles.length > 0 ? (
            viewMode === "grid" ? (
              <SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} gap={8}>
                {paginatedFiles.map((file) => (
                  <FileCard
                    key={file.key}
                    file={file}
                    activeFormat={globalFormat}
                    currentUrl={publicUrlGetter(file.key)}
                    isSelected={selectedKeys.includes(file.key)}
                    onToggleSelect={toggleSelect}
                    onDelete={onDelete}
                    onPreview={setPreviewFile}
                    onCopy={handleCopy}
                    onFormatChange={setGlobalFormat}
                    getFormattedLink={getFormattedLink}
                  />
                ))}
              </SimpleGrid>
            ) : (
              <Box
                bg={{ base: "whiteAlpha.700", _dark: "whiteAlpha.50" }}
                backdropFilter="blur(20px)"
                borderRadius="3xl"
                overflow="hidden"
                borderWidth="1px"
                borderColor={{
                  base: "whiteAlpha.400",
                  _dark: "whiteAlpha.100",
                }}
              >
                <Table.Root variant="outline" size="sm">
                  <Table.Header>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <Table.Row key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <Table.ColumnHeader
                            key={header.id}
                            fontWeight="bold"
                            fontSize="2xs"
                            textTransform="uppercase"
                            letterSpacing="widest"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </Table.ColumnHeader>
                        ))}
                        <Table.ColumnHeader textAlign="right">
                          {t("common.actions")}
                        </Table.ColumnHeader>
                      </Table.Row>
                    ))}
                  </Table.Header>
                  <Table.Body>
                    {paginatedFiles.map((file) => (
                      <Table.Row
                        key={file.key}
                        _hover={{ bg: "whiteAlpha.200" }}
                      >
                        <Table.Cell fontWeight="bold" fontSize="xs">
                          {file.key}
                        </Table.Cell>
                        <Table.Cell fontSize="xs">
                          {formatSize(file.size)}
                        </Table.Cell>
                        <Table.Cell fontSize="xs">
                          {file.lastModified
                            ? format(
                                new Date(file.lastModified),
                                "yyyy-MM-dd HH:mm"
                              )
                            : "-"}
                        </Table.Cell>
                        <Table.Cell textAlign="right">
                          <HStack gap={1} justify="flex-end">
                            <IconButton
                              aria-label="Preview"
                              size="xs"
                              variant="ghost"
                              onClick={() => setPreviewFile(file)}
                            >
                              <Eye size={14} />
                            </IconButton>
                            <IconButton
                              aria-label="Download"
                              size="xs"
                              variant="ghost"
                              onClick={() => onDownload(file)}
                            >
                              <Download size={14} />
                            </IconButton>
                            <IconButton
                              aria-label="Delete"
                              size="xs"
                              variant="ghost"
                              colorPalette="red"
                              onClick={() => onDelete(file.key)}
                            >
                              <Trash2 size={14} />
                            </IconButton>
                          </HStack>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            )
          ) : (
            <Center
              py={20}
              bg={{ base: "whiteAlpha.600", _dark: "whiteAlpha.50" }}
              backdropFilter="blur(10px)"
              borderRadius="3xl"
              borderWidth="1px"
              borderStyle="dashed"
              borderColor={{ base: "whiteAlpha.400", _dark: "whiteAlpha.100" }}
            >
              <VStack gap={4}>
                <Box
                  p={6}
                  borderRadius="full"
                  bg={{ base: "whiteAlpha.600", _dark: "whiteAlpha.50" }}
                  backdropFilter="blur(10px)"
                >
                  <FileIcon size={48} style={{ opacity: 0.2 }} />
                </Box>
                <Text fontWeight="bold" color="fg.muted">
                  {t("common.noData")}
                </Text>
              </VStack>
            </Center>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Flex justify="center" align="center" gap={4} pt={8}>
              <IconButton
                aria-label="Previous page"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                variant="outline"
                borderRadius="xl"
              >
                <ChevronLeft size={20} />
              </IconButton>
              <HStack gap={2}>
                {useMemo(
                  () =>
                    Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          size="sm"
                          variant={currentPage === page ? "solid" : "ghost"}
                          colorPalette="blue"
                          onClick={() => setCurrentPage(page)}
                          borderRadius="lg"
                          minW="10"
                        >
                          {page}
                        </Button>
                      )
                    ),
                  [totalPages, currentPage]
                )}
              </HStack>
              <IconButton
                aria-label="Next page"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                variant="outline"
                borderRadius="xl"
              >
                <ChevronRight size={20} />
              </IconButton>
            </Flex>
          )}

          {hasMore && (
            <Center pt={8}>
              <Button
                onClick={onLoadMore}
                loading={isLoadingMore}
                variant="ghost"
                colorPalette="blue"
                size="lg"
                borderRadius="2xl"
              >
                {t("common.loadMore")}
              </Button>
            </Center>
          )}
        </VStack>

        {/* Preview Modal */}
        <Portal>
          <AnimatePresence>
            {previewFile && (
              <FilePreview
                file={previewFile}
                isOpen={!!previewFile}
                onClose={() => setPreviewFile(null)}
                onDownload={() => onDownload(previewFile)}
                onCopyLink={() => onCopyLink(previewFile)}
                publicUrl={publicUrlGetter(previewFile.key)}
              />
            )}
          </AnimatePresence>
        </Portal>
      </Container>
    );
  }
);
