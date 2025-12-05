// Content Block Types for Topic Editor

export type ContentBlockType = 'rich-text' | 'image' | 'video' | 'video-player' | 'audio-player' | 'pdf' | 'file-download' | 'accordion' | 'callout' | 'button' | 'quiz' | 'tabs' | 'divider' | 'flipboxes' | 'image-text' | 'content-grid';

export interface BaseContentBlock {
  id: string;
  type: ContentBlockType;
  order: number;
}

export interface RichTextBlockSettings {
  content: string;
  fontSize?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textColor?: string;
  backgroundColor?: string;
  padding?: string;
}

export interface RichTextBlock extends BaseContentBlock {
  type: 'rich-text';
  settings: RichTextBlockSettings;
}

export interface ImageBlockSettings {
  imageUrl?: string;
  fileName?: string;
  altText?: string;
  caption?: string;
  alignment?: 'left' | 'center' | 'right';
  maxWidth?: string;
  borderRadius?: string;
  showCaption?: boolean;
}

export interface ImageBlock extends BaseContentBlock {
  type: 'image';
  settings: ImageBlockSettings;
}

export interface VideoBlockSettings {
  youtubeUrl?: string;
  videoId?: string;
  title?: string;
  startTime?: number;
  autoplay?: boolean;
  showControls?: boolean;
  muted?: boolean;
  loop?: boolean;
  aspectRatio?: '16:9' | '4:3' | '1:1';
}

export interface VideoBlock extends BaseContentBlock {
  type: 'video';
  settings: VideoBlockSettings;
}

export interface VideoPlayerBlockSettings {
  videoUrl?: string;
  fileName?: string;
  posterUrl?: string;
  title?: string;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  preload?: 'auto' | 'metadata' | 'none';
  width?: string;
  height?: string;
  captionsUrl?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | 'auto';
}

export interface VideoPlayerBlock extends BaseContentBlock {
  type: 'video-player';
  settings: VideoPlayerBlockSettings;
}

export interface AudioPlayerBlockSettings {
  audioUrl?: string;
  fileName?: string;
  title?: string;
  artist?: string;
  coverImageUrl?: string;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  volume?: number;
  preload?: 'auto' | 'metadata' | 'none';
  playerType?: 'sticky' | 'static';
  showDownload?: boolean;
  backgroundColor?: string;
  accentColor?: string;
}

export interface AudioPlayerBlock extends BaseContentBlock {
  type: 'audio-player';
  settings: AudioPlayerBlockSettings;
}

export interface PDFBlockSettings {
  pdfUrl?: string;
  fileName?: string;
  allowDownload?: boolean;
  displayHeight?: string;
}

export interface PDFBlock extends BaseContentBlock {
  type: 'pdf';
  settings: PDFBlockSettings;
}

export interface FileItem {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  url: string;
  type?: string;
  size?: number | string;
  uploadDate?: string;
}

export interface FileDownloadBlockSettings {
  files?: FileItem[];
  buttonStyle?: 'button' | 'link' | 'card';
  buttonColor?: string;
  buttonTextColor?: string;
  showFileSize?: boolean;
  showFileType?: boolean;
  showDescription?: boolean;
  trackDownloads?: boolean;
  requireLogin?: boolean;
}

export interface FileDownloadBlock extends BaseContentBlock {
  type: 'file-download';
  settings: FileDownloadBlockSettings;
}

export interface AccordionPanel {
  id: string;
  title: string;
  content: string;
}

export interface AccordionBlockSettings {
  panels?: AccordionPanel[];
  allowMultipleOpen?: boolean;
  defaultExpanded?: string[];
}

export interface AccordionBlock extends BaseContentBlock {
  type: 'accordion';
  settings: AccordionBlockSettings;
}

export interface CalloutBlockSettings {
  calloutType?: 'info' | 'success' | 'warning' | 'error';
  variant?: 'bordered' | 'filled' | 'outlined';
  title?: string;
  content?: string;
  showIcon?: boolean;
}

export interface CalloutBlock extends BaseContentBlock {
  type: 'callout';
  settings: CalloutBlockSettings;
}

export interface ButtonBlockSettings {
  buttonText?: string;
  buttonUrl?: string;
  buttonStyle?: 'primary' | 'secondary' | 'outline' | 'ghost';
  buttonSize?: 'small' | 'medium' | 'large';
  alignment?: 'left' | 'center' | 'right';
  openInNewTab?: boolean;
  icon?: 'arrow-right' | 'external' | 'download' | 'check' | 'none';
  iconPosition?: 'left' | 'right';
  backgroundColor?: string;
  textColor?: string;
}

export interface ButtonBlock extends BaseContentBlock {
  type: 'button';
  settings: ButtonBlockSettings;
}

export interface QuizAnswer {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  answers?: QuizAnswer[];
  correctAnswer?: string;
  explanation?: string;
}

export interface QuizBlockSettings {
  questions?: QuizQuestion[];
  showScoreImmediately?: boolean;
  allowRetry?: boolean;
  passingScore?: number;
}

export interface QuizBlock extends BaseContentBlock {
  type: 'quiz';
  settings: QuizBlockSettings;
}

export interface TabItem {
  id: string;
  label: string;
  content: string;
}

export interface TabsBlockSettings {
  tabs?: TabItem[];
  defaultTab?: string;
}

export interface TabsBlock extends BaseContentBlock {
  type: 'tabs';
  settings: TabsBlockSettings;
}

export interface DividerBlockSettings {
  dividerStyle?: 'solid' | 'dashed' | 'dotted' | 'double' | 'gradient';
  color?: string;
  thickness?: string;
  spacing?: string;
}

export interface DividerBlock extends BaseContentBlock {
  type: 'divider';
  settings: DividerBlockSettings;
}

export interface FlipboxItem {
  id: string;
  frontTitle: string;
  frontDescription?: string;
  frontIcon?: string;
  frontBgColor?: string;
  frontTextColor?: string;
  backTitle: string;
  backDescription?: string;
  backIcon?: string;
  backBgColor?: string;
  backTextColor?: string;
}

export interface FlipboxesBlockSettings {
  flipboxes?: FlipboxItem[];
  columns?: number;
  height?: string;
  frontBgColor?: string;
  frontTextColor?: string;
  backBgColor?: string;
  backTextColor?: string;
}

export interface FlipboxesBlock extends BaseContentBlock {
  type: 'flipboxes';
  settings: FlipboxesBlockSettings;
}

export interface ImageTextBlockSettings {
  layout?: 'image-left' | 'image-right' | 'image-top' | 'image-bottom';
  imageUrl?: string;
  imageAlt?: string;
  heading?: string;
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  content?: string;
  buttonText?: string;
  buttonUrl?: string;
  buttonVariant?: 'primary' | 'secondary' | 'success';
  buttonAlignment?: 'left' | 'center' | 'right';
}

export interface ImageTextBlock extends BaseContentBlock {
  type: 'image-text';
  settings: ImageTextBlockSettings;
}

export interface GridCardItem {
  id: string;
  imageUrl?: string;
  imageLayout?: 'no-image' | 'top-image' | 'background-image' | 'title-image';
  title: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
}

export interface ContentGridBlockSettings {
  items?: GridCardItem[];
  columns?: number;
  gap?: 'small' | 'medium' | 'large';
  cardStyle?: 'elevated' | 'bordered' | 'flat';
  imageAspectRatio?: '16:9' | '4:3' | '1:1';
  showShadow?: boolean;
}

export interface ContentGridBlock extends BaseContentBlock {
  type: 'content-grid';
  settings: ContentGridBlockSettings;
}

export type ContentBlock = RichTextBlock | ImageBlock | VideoBlock | VideoPlayerBlock | AudioPlayerBlock | PDFBlock | FileDownloadBlock | AccordionBlock | CalloutBlock | ButtonBlock | QuizBlock | TabsBlock | DividerBlock | FlipboxesBlock | ImageTextBlock | ContentGridBlock;

// Block Library Item
export interface BlockLibraryItem {
  id: ContentBlockType;
  name: string;
  description: string;
  icon: string;
  category: 'Essential' | 'Media' | 'Interactive' | 'Layout' | 'Text & Images';
}
