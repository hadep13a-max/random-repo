import type { Contestant, QuestionItem } from "./types";

export const TOPICS = [
  "Chuẩn bị dự thảo nghị quyết lãnh đạo thực hiện nhiệm vụ tháng 6 năm 2026.",
  "Chuẩn bị dự thảo nghị quyết lãnh đạo nâng cao chất lượng huấn luyện năm 2026.",
  "Chuẩn bị dự thảo nghị quyết chuyên đề lãnh đạo nâng cao chất lượng xây dựng chính quy, quản lý kỷ luật, bảo đảm an toàn năm 2026.",
];

export const ADMIN_USER = "admin";
export const ADMIN_PASS = "admin123";

const RANKS = [
  "Thượng úy", "Đại úy", "Trung úy", "Thiếu tá", "Trung tá",
];

export const DEFAULT_CONTESTANTS: Contestant[] = [
  { id: "c-1", stt: 1, name: "Phan Ngọc Quyền", rank: "Thượng úy", position: "BTCB", unit: "c1/d1", group: 1 },
  { id: "c-2", stt: 2, name: "Phạm Trung Nguyên", rank: "Trung úy", position: "BTCB", unit: "c2/d1", group: 1 },
  { id: "c-3", stt: 3, name: "Hồ Thân Long", rank: "Thượng úy", position: "BTCB", unit: "c3/d1", group: 1 },
  { id: "c-4", stt: 4, name: "Hồ Văn Duyên", rank: "Thiếu tá", position: "BTCB", unit: "c4/d1", group: 1 },
  { id: "c-5", stt: 5, name: "Trần Tuấn Anh", rank: "Thiếu tá", position: "BTCB", unit: "dbộ/d1", group: 1 },
  { id: "c-6", stt: 6, name: "Nguyễn Huy Hoàng", rank: "Thượng úy", position: "BTCB", unit: "c5/d2", group: 1 },
  { id: "c-7", stt: 7, name: "Nguyễn Văn Thái", rank: "Đại úy", position: "BTCB", unit: "c6/d2", group: 1 },
  { id: "c-8", stt: 8, name: "Phạm Ngọc Hải", rank: "Đại úy", position: "BTCB", unit: "c7/d2", group: 1 },
  { id: "c-9", stt: 9, name: "Lê Trung Nghĩa", rank: "Trung úy", position: "BTCB", unit: "c8/d2", group: 1 },
  { id: "c-10", stt: 10, name: "Hồ Ngọc Hùng", rank: "Đại úy", position: "BTCB", unit: "dbộ/d2", group: 2 },
  { id: "c-11", stt: 11, name: "Lâm Minh Tài", rank: "Thượng úy", position: "BTCB", unit: "c9/d3", group: 2 },
  { id: "c-12", stt: 12, name: "Nguyễn Đức Hải Dương", rank: "Thượng úy", position: "BTCB", unit: "c10/d3", group: 2 },
  { id: "c-13", stt: 13, name: "Nguyễn Lương Thế", rank: "Thượng úy", position: "BTCB", unit: "c11/d3", group: 2 },
  { id: "c-14", stt: 14, name: "Đặng Văn Học", rank: "Thượng úy", position: "BTCB", unit: "c12/d3", group: 2 },
  { id: "c-15", stt: 15, name: "Phạm Đình Phong", rank: "Thiếu tá", position: "BTCB", unit: "dbộ/d3", group: 2 },
  { id: "c-16", stt: 16, name: "Nguyễn Duy Khanh", rank: "Đại úy", position: "BTCB", unit: "c14", group: 2 },
  { id: "c-17", stt: 17, name: "Trần Quốc Lương", rank: "Thượng úy", position: "BTCB", unit: "c18", group: 2 },
  { id: "c-18", stt: 18, name: "Lê Văn Tú", rank: "Thượng úy", position: "BTCB", unit: "c19", group: 2 },
  { id: "c-19", stt: 19, name: "Lê Công Toàn", rank: "Đại úy", position: "BTCB", unit: "c20", group: 2 },
  { id: "c-20", stt: 20, name: "Mai Xuân Nam", rank: "Thiếu tá", position: "BTCB", unit: "c24", group: 2 },
  { id: "c-21", stt: 21, name: "Nguyễn Cảnh Toàn", rank: "Thiếu tá", position: "BTCB", unit: "c25", group: 2 },
];

export const DEFAULT_QUESTIONS: QuestionItem[] = [
  {
    id: "q-1",
    number: 1,
    text: `PHIẾU SỐ 1
Câu 1: Đồng chí trình bày nội dung "2 kiên định, 2 đẩy mạnh, 2 ngăn ngừa" và phương châm "5 vững" theo chỉ đạo của đồng chí Tô Lâm, Tổng Bí thư, Bí thư QUTW tại Đại hội Đảng bộ Quân đội lần thứ XII, nhiệm kỳ 2025-2030? Làm rõ nội dung 2 kiên định? Liên hệ thực tiễn?

Câu 2: Trên cương vị, chức trách nhiệm vụ được giao đồng chí xử lý tình huống sau: Trong buổi sinh hoạt chi bộ thường kỳ ra nghị quyết lãnh đạo thực hiện nhiệm vụ tháng. Khi thảo luận đóng góp vào dự thảo nghị quyết có 02 đảng viên tranh luận gay gắt và phát sinh mâu thuẫn cá nhân.`,
  },
  {
    id: "q-2",
    number: 2,
    text: `PHIẾU SỐ 2
Câu 1: Đồng chí nêu nhiệm vụ của chi bộ quy định trong Điều lệ Đảng Cộng sản Việt Nam. Phân tích nhiệm vụ thứ nhất? Liên hệ thực tiễn?

Câu 2: Trên cương vị, chức trách nhiệm vụ được giao đồng chí xử lý tình huống sau: Một số sỹ quan, quân nhân chuyên nghiệp (SQ, QNCN), nhận thức chưa đầy đủ đường lối, chủ trương, quan điểm của Đảng, Nhà nước, lấy lý do bận công việc chuyên môn, ít tham gia học tập chính trị.`,
  },
  {
    id: "q-3",
    number: 3,
    text: `PHIẾU SỐ 3
Câu 1: Đồng chí nêu những nội dung cơ bản tại Điều 2 (Tiêu chuẩn chung) trong Thông tư số 06/2025/TT-BQP ngày 26/01/2025 của BQP Quy định về đối tượng, tiêu chuẩn đào tạo cán bộ QĐND Việt Nam? Liên hệ thực tiễn?

Câu 2: Trên cương vị, chức trách nhiệm vụ được giao đồng chí xử lý tình huống sau: Trong giờ nghỉ hoặc trên nhóm zalo nội bộ của đơn vị, có một đảng viên thường xuyên phát biểu với nội dung như: "Một số chủ trương của cấp trên không phù hợp với thực tế", "triển khai như vậy chỉ là hình thức". Những phát biểu này khiến một số quần chúng dao động tư tưởng.`,
  },
  {
    id: "q-4",
    number: 4,
    text: `PHIẾU SỐ 4
Câu 1: Đồng chí nêu và làm rõ nhiệm vụ công tác kiểm tra, giám sát của chi bộ theo Quy định số 21-QĐ/TW ngày 11/4/2026 của BCHTW? Liên hệ thực tiễn?

Câu 2: Trên cương vị, chức trách nhiệm vụ được giao đồng chí xử lý tình huống sau: Trong kiểm điểm, đánh giá, xếp loại chất lượng tổ chức đảng, đảng viên, cán bộ, QNCN cuối năm, một số đảng viên chỉ tập trung nêu ưu điểm, thành tích, ít đề cập khuyết điểm hoặc nêu rất chung chung; các ý kiến góp ý có biểu hiện nể nang, né tránh.`,
  },
  {
    id: "q-5",
    number: 5,
    text: `PHIẾU SỐ 5
Câu 1: Đồng chí hãy nêu các tiêu chuẩn xây dựng đơn vị an toàn, địa bàn an toàn theo Quy chế số 1359/QC-CT ngày 24/9/2009 của TCCT về xây dựng đơn vị an toàn, địa bàn an toàn ở đơn vị cơ sở trong QĐND Việt Nam? Làm rõ tiêu chuẩn 1, tiêu chuẩn 2? Liên hệ thực tiễn?

Câu 2: Trên cương vị, chức trách nhiệm vụ được giao đồng chí xử lý tình huống sau: Trước thời điểm bình xét thi đua, chi bộ nhận được đơn thư nặc danh tố cáo một đảng viên giữ chức vụ quản lý có biểu hiện thiếu minh bạch về tài chính. Nội bộ xuất hiện nhiều ý kiến trái chiều, ảnh hưởng đoàn kết đơn vị.`,
  },
  {
    id: "q-6",
    number: 6,
    text: `PHIẾU SỐ 6
Câu 1: Đồng chí cho biết Quy chế số 718-QC/QUTW, ngày 05/11/2021 của Quân ủy Trung ương về Công tác dân vận của Quân đội nhân dân Việt Nam xác định phương châm công tác dân vận hiện nay như thế nào? Phân tích các phương châm? Liên hệ thực tiễn?

Câu 2: Trên cương vị, chức trách nhiệm vụ được giao đồng chí xử lý tình huống sau: Vợ của một đồng chí cán bộ đại đội trong đơn vị bỏ nhà đi theo tà đạo có nhiều hoạt động mê tín dị đoan, làm cho đồng chí băn khoăn, lo lắng, thiếu yên tâm công tác.`,
  },
  {
    id: "q-7",
    number: 7,
    text: `PHIẾU SỐ 7
Câu 1: Đồng chí cho biết theo Điều 3, Nghị định số 27/2016/NĐ-CP ngày 06/4/2026 của Chính phủ: Chế độ nghỉ phép đối với hạ sĩ quan, binh sĩ phục vụ tại ngũ được quy định như thế nào? Liên hệ thực tiễn?

Câu 2: Trên cương vị, chức trách nhiệm vụ được giao đồng chí xử lý tình huống sau: Sau cuộc họp chi bộ, một đảng viên đưa nội dung thảo luận nội bộ lên một số nhóm mạng xã hội hoặc trao đổi với người không có trách nhiệm, làm phát sinh dư luận trong đơn vị.`,
  },
  {
    id: "q-8",
    number: 8,
    text: `PHIẾU SỐ 8
Câu 1: Đồng chí nêu và phân tích các bước tiến hành thực hiện Mô hình "Tiết kiệm chi tiêu, vì ngày mai lập nghiệp" theo Công văn số 531/CCT-QC ngày 18/3/2025 của CCT Quân đoàn 34 về việc tiếp tục triển khai, thống nhất một số nội dung hoạt động CTĐ&PTTN? Liên hệ thực tiễn?

Câu 2: Trên cương vị, chức trách nhiệm vụ được giao đồng chí xử lý tình huống sau: Một số đảng viên trẻ trong chi bộ tham gia sinh hoạt đầy đủ nhưng hầu như không tham gia phát biểu ý kiến.`,
  },
  {
    id: "q-9",
    number: 9,
    text: `PHIẾU SỐ 9
Câu 1: Đồng chí trình bày nguyên tắc tiến hành công tác quản lý tư tưởng quân nhân; nắm và định hướng dư luận trong Quân đội hiện nay (theo Quy chế số 775)? Liên hệ thực tiễn?

Câu 2: Trên cương vị, chức trách nhiệm vụ được giao đồng chí xử lý tình huống sau: Chi bộ đang xem xét kết nạp một quần chúng ưu tú vào Đảng. Đồng chí này có kết quả hoàn thành nhiệm vụ tốt, tích cực trong công tác, được các cấp ghi nhận. Tuy nhiên, trong đơn vị xuất hiện một số dư luận phản ánh về lối sống, quan hệ cá nhân chưa thật sự chuẩn mực.`,
  },
  {
    id: "q-10",
    number: 10,
    text: `PHIẾU SỐ 10
Câu 1: Đồng chí nêu và phân tích các bước sinh hoạt chi bộ thường kỳ theo Hướng dẫn số 12/HD-PCT, ngày 30/01/2026 của Phòng Chính trị Sư đoàn về một số vấn đề về tiếp tục đổi mới và nâng cao chất lượng sinh hoạt chi bộ trong Đảng bộ Sư đoàn giai đoạn mới? Liên hệ thực tiễn?

Câu 2: Trên cương vị, chức trách nhiệm vụ được giao đồng chí xử lý tình huống sau: Một đồng chí trung đội trưởng lập gia đình đã nhiều năm nhưng chưa có con, mặc dù vợ, chồng đã đi chữa trị ở nhiều bệnh viện nhưng chưa có kết quả, nảy sinh tư tưởng thiếu yên tâm công tác.`,
  },
  {
    id: "q-11",
    number: 11,
    text: `PHIẾU SỐ 11
Câu 1: Đồng chí cho biết những trường hợp chưa xét thăng quân hàm, nâng lương cơ bản được quy định trong Hướng dẫn số 22/HD-CT ngày 05 tháng 01 năm 2023 được quy định như thế nào? Liên hệ thực tiễn?

Câu 2: Trên cương vị, chức trách nhiệm vụ được giao đồng chí xử lý tình huống sau: Trong chi bộ có một đảng viên thường xuyên có thái độ thiếu hợp tác, phát ngôn gây chia rẽ, ảnh hưởng đến các mối quan hệ trong tập thể.`,
  },
  {
    id: "q-12",
    number: 12,
    text: `PHIẾU SỐ 12
Câu 1: Đồng chí nêu và làm rõ các bước tiến hành giám sát đảng viên của chi bộ theo Quyết định số 1178-QĐ/UBKT ngày 06/11/2018 của Uỷ ban Kiểm tra Quân uỷ Trung ương? Liên hệ thực tiễn?

Câu 2: Trên cương vị, chức trách nhiệm vụ được giao đồng chí xử lý tình huống sau: Một số cán bộ, nhất là cán bộ trẻ có biểu hiện dựa dẫm vào mối quan hệ với cấp trên và người thân, thiếu rèn luyện phấn đấu, giải quyết mối quan hệ cấp trên, cấp dưới, đồng chí, đồng đội không chuẩn mực, gây bất bình trong đơn vị.`,
  },
  {
    id: "q-13",
    number: 13,
    text: `PHIẾU SỐ 13
Câu 1: Đồng chí hãy nêu khung tiêu chí đánh giá chất lượng sinh hoạt chi bộ theo Hướng dẫn số 12/HD-PCT, ngày 30/01/2026 của Phòng Chính trị Sư đoàn về một số vấn đề về tiếp tục đổi mới và nâng cao chất lượng sinh hoạt chi bộ trong Đảng bộ Sư đoàn giai đoạn mới? Liên hệ thực tiễn?

Câu 2: Trên cương vị, chức trách nhiệm vụ được giao đồng chí xử lý tình huống sau: Một đồng chí sỹ quan của đơn vị được giao nhiệm vụ huấn luyện, diễn tập trong điều kiện khó khăn, vất vả, đã lấy lý do vợ con ốm đau để xin nghỉ phép, tranh thủ.`,
  },
  {
    id: "q-14",
    number: 14,
    text: `PHIẾU SỐ 14
Câu 1: Đồng chí nêu hoạt động của Bí thư chi bộ, chính trị viên đại đội trong trạng thái sẵn sàng chiến đấu cao và toàn bộ? Liên hệ thực tiễn?

Câu 2: Trên cương vị, chức trách nhiệm vụ được giao đồng chí xử lý tình huống sau: Một đồng chí sỹ quan trong đơn vị vay tiền với lãi suất cao, tham gia cá độ, đánh bạc không có khả năng thanh toán, dẫn đến bị bệnh trầm cảm, chất lượng thực hiện nhiệm vụ giảm sút.`,
  },
  {
    id: "q-15",
    number: 15,
    text: `PHIẾU SỐ 15
Câu 1: Đồng chí cho biết tiêu chí phát hiện đảng viên có vi phạm cần được chi bộ giáo dục, giúp đỡ trước khi xem xét, quyết định đưa ra khỏi Đảng (theo Hướng dẫn số 1002/HD-CT ngày 11/6/2021 của Tổng cục Chính trị)? Liên hệ thực tiễn?

Câu 2: Trên cương vị, chức trách nhiệm vụ được giao đồng chí xử lý tình huống sau: Một số cấp ủy viên, đảng viên phản ánh dự thảo nghị quyết lãnh đạo thực hiện nhiệm vụ hằng tháng của chi bộ do bí thư chuẩn bị nhưng chưa thông qua chi uỷ; nhiều nội dung đã được quyết định trước, đảng viên cảm thấy việc thảo luận chỉ mang tính hình thức.`,
  },
  {
    id: "q-16",
    number: 16,
    text: `PHIẾU SỐ 16
Câu 1: Đồng chí cho biết tại Hướng dẫn số 463/HD-BCT ngày 27/3/2026 của Ban Chính trị Trung đoàn về hướng đánh giá, xếp loại chất lượng đối với cán bộ các cấp trong Trung đoàn quy định khung tiêu chí đánh giá xếp loại chất lượng cụ thể như thế nào? Liên hệ thực tiễn?

Câu 2: Trên cương vị, chức trách nhiệm vụ được giao đồng chí xử lý tình huống sau: Chi bộ tổ chức sinh hoạt thường kỳ trong nhiều tháng liên tiếp thời gian sinh hoạt ngắn, chủ yếu là đọc dự thảo báo cáo, dự thảo nghị quyết là chính vì ít đảng viên tham thảo luận.`,
  },
  {
    id: "q-17",
    number: 17,
    text: `PHIẾU SỐ 17
Câu 1: Đồng chí hãy nêu các mức bình xét đánh giá đơn vị an toàn và cho biết tiêu chí để đánh giá đơn vị không đạt an toàn theo Quy chế số 1359/QC-CT ngày 24/9/2009 của TCCT? Liên hệ thực tiễn?

Câu 2: Trên cương vị, chức trách nhiệm vụ được giao đồng chí xử lý tình huống sau: Chi bộ có một đảng viên thời gian gần đây có biểu hiện làm việc cầm chừng, ngại khó, ngại khổ, thiếu tinh thần trách nhiệm; ít tham gia phát biểu xây dựng tập thể, né tránh nhiệm vụ khó được giao.`,
  },
  {
    id: "q-18",
    number: 18,
    text: `PHIẾU SỐ 18
Câu 1: Đồng chí cho biết Văn bản hợp nhất số 22/VBHN-BQP ngày 28/7/2025 của Bộ quốc phòng quy định về thực hiện dân chủ cơ sở trong Quân đội nhân dân Việt Nam xác định hội nghị tập thể quân nhân thực hiện những nội dung gì? Liên hệ thực tiễn?

Câu 2: Trên cương vị, chức trách nhiệm vụ được giao đồng chí xử lý tình huống sau: Trong quá trình xem xét kết nạp đảng viên mới, có ý kiến phản ánh hồ sơ của quần chúng A chưa đủ điều kiện về thời gian thử thách, nhưng một số cấp ủy viên đề nghị "linh hoạt" để đủ chỉ tiêu kết nạp trong năm.`,
  },
  {
    id: "q-19",
    number: 19,
    text: `PHIẾU SỐ 19
Câu 1: Đồng chí cho biết nội dung kiểm tra nắm tình hình trong Kế hoạch số 359/KH/ĐU ngày 21/3/2026 của Đảng ủy Trung đoàn về thực hiện dân chủ cơ sở trong Trung đoàn năm 2026 gồm những nội dung gì? Liên hệ thực tiễn?

Câu 2: Trên cương vị, chức trách nhiệm vụ được giao đồng chí xử lý tình huống sau: Bố của một đồng chí cán bộ đại đội gần đơn vị thường xuyên gặp gỡ, trao đổi thông tin với một số đối tượng xấu, làm cho SQ, QNCN trong đơn vị nghi ngờ, thiếu tin tưởng chỉ huy.`,
  },
  {
    id: "q-20",
    number: 20,
    text: `PHIẾU SỐ 20
Câu 1: Đồng chí cho biết theo Quyết định số 15/2009/QĐ-TTg ngày 21/01/2009 của Thủ tướng Chính phủ, có bao nhiêu nhóm ngành được hưởng đặc thù quân sự, đó là những nhóm ngành nào? Liên hệ thực tiễn?

Câu 2: Trên cương vị, chức trách nhiệm vụ được giao đồng chí xử lý tình huống sau: Một cán bộ trung đội trưởng mới ra trường trong quá trình quản lý, chỉ huy còn để một số chiến sỹ vi phạm kỷ luật, bị cấp trên phê bình nhắc nhở, làm đồng chí băn khoăn thiếu tự tin về khả năng hoàn thành nhiệm vụ.`,
  },
];

export const TABLE_TURNS: Record<1 | 2, number> = { 1: 10, 2: 11 };
