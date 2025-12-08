import type { ContentBlock, ContentBlockType } from '../types/contentBlocks';

// Extract YouTube video ID from various URL formats
export const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

// Create default block settings
export const createDefaultBlock = (blockType: ContentBlockType, order: number): ContentBlock => {
  const baseBlock = {
    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    order,
  };

  switch (blockType) {
    case 'rich-text':
      return {
        ...baseBlock,
        type: 'rich-text',
        settings: {
          content: '<p>Start typing your content here...</p>',
          fontSize: '16px',
          textAlign: 'left',
          textColor: '#374151',
          backgroundColor: 'transparent',
          padding: '16px',
        },
      };

    case 'image':
      return {
        ...baseBlock,
        type: 'image',
        settings: {
          imageUrl: '',
          fileName: '',
          altText: '',
          caption: '',
          alignment: 'center',
          maxWidth: '100%',
          borderRadius: '8px',
          showCaption: true,
        },
      };

    case 'video':
      return {
        ...baseBlock,
        type: 'video',
        settings: {
          youtubeUrl: '',
          videoId: '',
          title: 'Video',
          startTime: 0,
          autoplay: false,
          showControls: true,
          muted: false,
          loop: false,
          aspectRatio: '16:9',
        },
      };

    case 'video-player':
      return {
        ...baseBlock,
        type: 'video-player',
        settings: {
          videoUrl: '',
          fileName: '',
          posterUrl: '',
          title: 'Video Player',
          controls: true,
          autoplay: false,
          loop: false,
          muted: false,
          preload: 'metadata',
          aspectRatio: '16:9',
        },
      };

    case 'audio-player':
      return {
        ...baseBlock,
        type: 'audio-player',
        settings: {
          audioUrl: '',
          fileName: '',
          title: 'Audio Track',
          artist: '',
          coverImageUrl: '',
          controls: true,
          autoplay: false,
          loop: false,
          muted: false,
          volume: 0.8,
          preload: 'metadata',
          playerType: 'static',
          showDownload: true,
          backgroundColor: '#ffffff',
          accentColor: '#6366f1',
        },
      };

    case 'pdf':
      return {
        ...baseBlock,
        type: 'pdf',
        settings: {
          pdfUrl: '',
          fileName: '',
          allowDownload: true,
          displayHeight: '600px',
        },
      };

    case 'file-download':
      return {
        ...baseBlock,
        type: 'file-download',
        settings: {
          files: [],
          buttonStyle: 'button',
          buttonColor: '#3b82f6',
          buttonTextColor: '#ffffff',
          showFileSize: true,
          showFileType: true,
          showDescription: true,
          trackDownloads: true,
          requireLogin: false,
        },
      };

    case 'accordion':
      return {
        ...baseBlock,
        type: 'accordion',
        settings: {
          panels: [],
          allowMultipleOpen: false,
          defaultExpanded: [],
        },
      };

    case 'callout':
      return {
        ...baseBlock,
        type: 'callout',
        settings: {
          calloutType: 'info',
          variant: 'bordered',
          title: '',
          content: '',
          showIcon: true,
        },
      };

    case 'button':
      return {
        ...baseBlock,
        type: 'button',
        settings: {
          buttonText: 'Click Here',
          buttonUrl: '',
          buttonStyle: 'primary',
          buttonSize: 'medium',
          alignment: 'left',
          openInNewTab: false,
          icon: 'none',
          iconPosition: 'right',
          backgroundColor: '#3b82f6',
          textColor: '#ffffff',
        },
      };

    case 'quiz':
      return {
        ...baseBlock,
        type: 'quiz',
        settings: {
          questions: [],
          showScoreImmediately: true,
          allowRetry: true,
          passingScore: 70,
        },
      };

    case 'tabs':
      return {
        ...baseBlock,
        type: 'tabs',
        settings: {
          tabs: [],
          defaultTab: '',
        },
      };

    case 'divider':
      return {
        ...baseBlock,
        type: 'divider',
        settings: {
          dividerStyle: 'solid',
          color: '#e5e7eb',
          thickness: '2px',
          spacing: '16px',
        },
      };

    case 'flipboxes':
      return {
        ...baseBlock,
        type: 'flipboxes',
        settings: {
          flipboxes: [],
          columns: 3,
          height: '300px',
          frontBgColor: '#3b82f6',
          frontTextColor: '#ffffff',
          backBgColor: '#1e40af',
          backTextColor: '#ffffff',
        },
      };

    case 'image-text':
      return {
        ...baseBlock,
        type: 'image-text',
        settings: {
          layout: 'image-left',
          imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
          imageAlt: 'Sample image',
          heading: 'Sample Heading',
          headingLevel: 'h2',
          content: '<p>This is a sample image-text block. You can customize the layout, add headings, style the content, and include call-to-action buttons. Edit this block to add your own content and images.</p>',
          buttonText: 'Learn More',
          buttonUrl: '',
          buttonVariant: 'primary',
          buttonAlignment: 'left',
        },
      };

    case 'content-grid':
      return {
        ...baseBlock,
        type: 'content-grid',
        settings: {
          items: [
            {
              id: `item-${Date.now()}-1`,
              imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
              imageLayout: 'top-image',
              title: 'Feature Card 1',
              description: 'This is a sample content grid item showcasing your first feature. You can add images, customize layout, and include call-to-action buttons.',
              buttonText: 'Learn More',
              buttonUrl: '#',
            },
            {
              id: `item-${Date.now()}-2`,
              imageUrl: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&h=600&fit=crop',
              imageLayout: 'background-image',
              title: 'Feature Card 2',
              description: 'Another grid item with background image layout. Perfect for creating engaging content sections with visual appeal.',
              buttonText: 'Get Started',
              buttonUrl: '#',
            },
            {
              id: `item-${Date.now()}-3`,
              imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
              imageLayout: 'title-image',
              title: 'Feature Card 3',
              description: 'This card uses the side layout with title, image, then content. Great for showcasing different content types.',
              buttonText: 'Explore',
              buttonUrl: '#',
            },
          ],
          columns: 3,
          gap: 'medium',
          cardStyle: 'elevated',
          imageAspectRatio: '16:9',
          showShadow: true,
        },
      };

    case 'banner':
      return {
        ...baseBlock,
        type: 'banner',
        settings: {
          backgroundImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&h=900&fit=crop',
          backgroundColor: '#1f2937',
          overlayColor: '#000000',
          overlayOpacity: 50,
          title: 'Welcome to the Course',
          titleSize: 48,
          titleColor: '#ffffff',
          subtitle: 'Discover new skills and expand your knowledge with our comprehensive learning materials.',
          subtitleColor: 'rgba(255, 255, 255, 0.9)',
          buttonText: 'Get Started',
          buttonUrl: '#',
          buttonColor: '#6366f1',
          buttonTextColor: '#ffffff',
          contentAlignment: 'center',
          verticalAlignment: 'center',
          height: 450,
          fullHeight: false,
          parallax: false,
        },
      };

    case 'testimonials':
      return {
        ...baseBlock,
        type: 'testimonials',
        settings: {
          testimonials: [
            {
              id: `testimonial-${Date.now()}-1`,
              name: 'Sarah Johnson',
              role: 'Marketing Manager',
              company: 'TechCorp',
              avatar: '',
              content: 'This course completely transformed my understanding of the subject. The content was well-structured and the instructor made complex topics easy to understand.',
              rating: 5,
            },
            {
              id: `testimonial-${Date.now()}-2`,
              name: 'Michael Chen',
              role: 'Software Developer',
              company: 'StartupXYZ',
              avatar: '',
              content: 'Excellent course material with practical examples. I was able to apply what I learned immediately in my work. Highly recommended!',
              rating: 5,
            },
            {
              id: `testimonial-${Date.now()}-3`,
              name: 'Emily Rodriguez',
              role: 'Product Designer',
              company: 'DesignStudio',
              avatar: '',
              content: 'The best online learning experience I\'ve had. Clear explanations, great pace, and valuable insights throughout the entire course.',
              rating: 4,
            },
          ],
          layout: 'grid',
          columns: 3,
          showRating: true,
          showAvatar: true,
          cardStyle: 'elevated',
          accentColor: '#6366f1',
          autoplay: false,
          autoplaySpeed: 5,
        },
      };

    case 'timeline':
      return {
        ...baseBlock,
        type: 'timeline',
        settings: {
          items: [
            {
              id: `timeline-${Date.now()}-1`,
              title: 'Getting Started',
              date: 'Week 1',
              content: 'Introduction to core concepts and foundational knowledge. Set up your learning environment and get familiar with the basics.',
              icon: 'rocket',
              iconColor: '#6366f1',
            },
            {
              id: `timeline-${Date.now()}-2`,
              title: 'Building Skills',
              date: 'Week 2-3',
              content: 'Deep dive into practical applications. Work through hands-on exercises and build your first projects.',
              icon: 'star',
              iconColor: '#10b981',
            },
            {
              id: `timeline-${Date.now()}-3`,
              title: 'Advanced Topics',
              date: 'Week 4',
              content: 'Explore advanced techniques and best practices. Learn from real-world case studies and expert insights.',
              icon: 'flag',
              iconColor: '#f59e0b',
            },
            {
              id: `timeline-${Date.now()}-4`,
              title: 'Completion',
              date: 'Week 5',
              content: 'Final project and assessment. Apply everything you\'ve learned and earn your certificate of completion.',
              icon: 'check',
              iconColor: '#ef4444',
            },
          ],
          layout: 'vertical',
          lineColor: '#e5e7eb',
          dotColor: '#6366f1',
          alternating: true,
          showDates: true,
          showIcons: true,
        },
      };

    default:
      throw new Error(`Unknown block type: ${blockType}`);
  }
};

// Reorder blocks
export const reorderBlocks = (
  blocks: ContentBlock[],
  dragIndex: number,
  dropIndex: number
): ContentBlock[] => {
  const result = Array.from(blocks);
  const [removed] = result.splice(dragIndex, 1);
  result.splice(dropIndex, 0, removed);
  
  // Update order values
  return result.map((block, index) => ({
    ...block,
    order: index,
  }));
};

// Get block icon emoji
export const getBlockIcon = (blockType: ContentBlockType): string => {
  switch (blockType) {
    case 'rich-text':
      return '📝';
    case 'image':
      return '🖼️';
    case 'video':
      return '🎥';
    case 'video-player':
      return '🎬';
    case 'audio-player':
      return '🎵';
    case 'pdf':
      return '📄';
    case 'file-download':
      return '📎';
    case 'accordion':
      return '📋';
    case 'callout':
      return '💡';
    case 'button':
      return '🔘';
    case 'quiz':
      return '❓';
    case 'tabs':
      return '📋';
    case 'divider':
      return '➖';
    case 'flipboxes':
      return '🔄';
    case 'image-text':
      return '🖼️';
    case 'content-grid':
      return '⊞';
    case 'banner':
      return '🎯';
    case 'testimonials':
      return '💬';
    case 'timeline':
      return '📅';
    default:
      return '📄';
  }
};

// Get block color
export const getBlockColor = (blockType: ContentBlockType): string => {
  switch (blockType) {
    case 'rich-text':
      return '#3b82f6'; // blue
    case 'image':
      return '#10b981'; // green
    case 'video':
      return '#ef4444'; // red
    case 'video-player':
      return '#8b5cf6'; // purple
    case 'audio-player':
      return '#f59e0b'; // amber/orange
    case 'content-grid':
      return '#10b981'; // teal/green
    case 'banner':
      return '#8b5cf6'; // purple
    case 'testimonials':
      return '#f59e0b'; // amber
    case 'timeline':
      return '#8b5cf6'; // purple
    default:
      return '#6b7280'; // gray
  }
};
