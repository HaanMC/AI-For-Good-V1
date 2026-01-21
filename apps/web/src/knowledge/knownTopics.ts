/**
 * Known Topics for Grade 10 Vietnamese Literature
 * Aggregates topics from multiple sources for validation
 */

import {
  GRADE_10_EXAM_TOPICS,
  SEMESTER_1_WORKS,
  SEMESTER_2_WORKS
} from '../shared/knowledge/grade10-literature-knowledge';

/**
 * Extract unique work titles and author combinations from works list
 */
function extractWorkTopics(): string[] {
  const allWorks = [...SEMESTER_1_WORKS, ...SEMESTER_2_WORKS];
  const topics: string[] = [];

  for (const work of allWorks) {
    // Add work title
    topics.push(work.title);

    // Add "title (author)" format
    topics.push(`${work.title} (${work.author})`);

    // Add author name
    topics.push(work.author);

    // Add key themes as potential topics
    for (const theme of work.themes) {
      topics.push(theme);
    }
  }

  return topics;
}

/**
 * Additional common topic keywords and phrases that students might search for
 * These help match partial/informal queries
 */
const ADDITIONAL_TOPIC_KEYWORDS: string[] = [
  // Work name shortcuts
  "Đăm Săn",
  "Mtao Mxây",
  "Chiến thắng Mtao Mxây",
  "Héc-to",
  "Ăng-đrô-mác",
  "Iliad",
  "Ra-ma",
  "Ramayana",
  "Hê-ra-clét",
  "Thu hứng",
  "Cảm xúc mùa thu",
  "Tự tình",
  "Câu cá mùa thu",
  "Xúy Vân",
  "Xúy Vân giả dại",
  "Thị Hến",
  "Mắc mưu Thị Hến",
  "Thị Mầu",
  "Thị Mầu lên chùa",
  "Bình Ngô đại cáo",
  "Đại cáo bình Ngô",
  "Bảo kính cảnh giới",
  "Dục Thúy Sơn",
  "Huấn Cao",
  "Chữ người tử tù",
  "Người ở bến sông Châu",
  "Dưới bóng hoàng lan",
  "Một chuyện đùa nho nhỏ",
  "Đất nước",
  "Lính đảo hát tình ca trên đảo",
  "Mùa hoa mận",
  "Đi trong hương tràm",
  "Hiền tài là nguyên khí của quốc gia",
  "Yêu và đồng cảm",
  "Bản sắc là hành trang",
  "Tản Viên từ Phán sự lục",

  // Authors
  "Nguyễn Du",
  "Chế Lan Viên",
  "Hàn Mạc Tử",
  "Xuân Diệu",
  "Huy Cận",
  "Viễn Phương",
  "Quang Dũng",
  "Nguyễn Khoa Điềm",
  "Nguyễn Trung Thành",
  "Nguyễn Thành Long",
  "Nguyễn Quang Sáng",
  "Nguyễn Dữ",
  "Hồ Chí Minh",
  "Hồ Xuân Hương",
  "Nguyễn Khuyến",
  "Đỗ Phủ",
  "Nguyễn Trãi",
  "Nguyễn Tuân",
  "Thạch Lam",
  "Chekhov",
  "Chu Thùy Liên",
  "Hoài Vũ",
  "Thân Nhân Trung",
  "Chu Quang Tiềm",
  "Lê Quý Đôn",
  "Nguyễn Thiếp",
  "Hoàng Phủ Ngọc Tường",

  // Common work titles (from SEMESTER works)
  "Đoạn trường tân thanh",
  "Tiếng hát con tàu",
  "Đây thôn Vỹ Dạ",
  "Vội vàng",
  "Tràng giang",
  "Viếng lăng Bác",
  "Tây Tiến",
  "Rừng xà nu",
  "Lặng lẽ Sa Pa",
  "Chiếc lược ngà",
  "Chuyện người con gái Nam Xương",
  "Tức cảnh Pác Bó",
  "Những đồi hoa sim",
  "Vượt sông",
  "Bàn luận về phép học",
  "Người lái đò Sông Đà",
  "Ai đã đặt tên cho dòng sông",

  // Genres and types
  "Sử thi",
  "Thần thoại",
  "Thơ Đường luật",
  "Thơ tự do",
  "Chèo",
  "Tuồng",
  "Sân khấu dân gian",
  "Truyện ngắn",
  "Truyện trung đại",
  "Văn nghị luận",
  "Nghị luận xã hội",
  "Nghị luận văn học",

  // Common analysis topics
  "Phân tích nhân vật",
  "Phân tích hình tượng",
  "Cảm nhận bài thơ",
  "Vẻ đẹp thiên nhiên",
  "Vẻ đẹp sử thi",
  "Tư tưởng nhân nghĩa",
  "Nghệ thuật kể chuyện",
  "Nghệ thuật nghị luận",
  "Hình tượng người anh hùng",
  "Hình tượng người lính",
  "Lòng yêu nước",
  "Bản sắc văn hóa",
  "Tình yêu thương",
  "Đồng cảm",
  "Hiền tài quốc gia"
];

/**
 * Combined unique list of all known topics
 * Used for validation and suggestion matching
 */
export const KNOWN_TOPICS: string[] = (() => {
  const allTopics = new Set<string>();

  // Add exam topics (primary source)
  for (const topic of GRADE_10_EXAM_TOPICS) {
    allTopics.add(topic);
  }

  // Add extracted work topics
  for (const topic of extractWorkTopics()) {
    allTopics.add(topic);
  }

  // Add additional keywords
  for (const keyword of ADDITIONAL_TOPIC_KEYWORDS) {
    allTopics.add(keyword);
  }

  return Array.from(allTopics);
})();

/**
 * Quick suggestions to show as chips (subset of GRADE_10_EXAM_TOPICS)
 * Re-exported for convenience
 */
export const QUICK_SUGGESTIONS = GRADE_10_EXAM_TOPICS;
