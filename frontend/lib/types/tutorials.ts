interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  order: number;
  modules: Module[];
}

interface Module {
  id: string;
  title: string;
  description: string;
  slug: string;
  videoUrl: string;
  thumbnail: string;
  duration: number;
  order: number;
  isFree: boolean;
  isPublished: boolean;
  categoryId: string;
  lessons: Lesson[];
  resources: Resource[];
  _count: {
    lessons: number;
    resources: number;
  };
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl: string;
  duration: number;
  order: number;
}

interface Resource {
  id: string;
  title: string;
  type: string;
  url: string;
}
