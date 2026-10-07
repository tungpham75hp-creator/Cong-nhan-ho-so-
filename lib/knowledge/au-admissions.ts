// Nguồn kiến thức DUY NHẤT của chatbot tư vấn du học Úc.
// Chatbot chỉ được trả lời dựa trên nội dung dưới đây (xem lib/chat.ts).
// Muốn bot biết thêm điều gì, hãy bổ sung vào đây — không thêm vào prompt.
//
// Nội dung được tóm tắt từ các trang chính thức của Study Australia
// (studyaustralia.gov.au) và Bộ Giáo dục Úc (education.gov.au), thu thập tháng 10/2026.
// Cần đối chiếu lại với trang Bộ Nội vụ Úc (immi.homeaffairs.gov.au) trước khi dùng thật,
// vì các số liệu (phí, mức chứng minh tài chính, điểm tiếng Anh) có thể thay đổi.

export const AU_ADMISSIONS_KNOWLEDGE = `
# QUY ĐỊNH TUYỂN SINH VÀ VISA DU HỌC ÚC (VISA SINH VIÊN SUBCLASS 500)

## 1. Khung pháp lý và cơ sở đào tạo
- Luật Education Services for Overseas Students Act 2000 (ESOS Act) và các văn bản liên quan là khung pháp lý điều chỉnh việc đào tạo sinh viên quốc tế tại Úc, nhằm bảo vệ quyền lợi sinh viên quốc tế đang học bằng visa sinh viên.
- Chỉ các cơ sở giáo dục đã đăng ký theo ESOS Act và có tên trong danh sách CRICOS (Commonwealth Register of Institutions and Courses for Overseas Students) mới được nhận sinh viên quốc tế học bằng visa sinh viên.

## 2. Các bước nộp hồ sơ xin visa sinh viên
1. Thư mời nhập học (Letter of Offer): nhận và chấp nhận thư mời từ cơ sở đào tạo; cần đọc kỹ điều khoản và chính sách hoàn phí, và giữ lại một bản sao.
2. Xác nhận nhập học (Confirmation of Enrolment – CoE): được cấp sau khi bạn chấp nhận thư mời và đóng tiền đặt cọc. CoE xác nhận bạn đã ghi danh vào một khoá học cụ thể.
3. Trình độ tiếng Anh: nộp chứng chỉ của một bài thi tiếng Anh được chấp nhận.
4. Yêu cầu Sinh viên chân chính (Genuine Student – GS): trả lời các câu hỏi trong hồ sơ về hoàn cảnh cá nhân, lý do chọn khoá học và ý định học tập.
5. Năng lực tài chính: chứng minh có khoản tiết kiệm tối thiểu 29.710 AUD để trang trải chi phí.
6. Bảo hiểm y tế sinh viên quốc tế (Overseas Student Health Cover – OSHC): bắt buộc phải có trong suốt thời gian ở Úc.
7. Khám sức khoẻ: thực hiện các kiểm tra sức khoẻ theo yêu cầu, qua dịch vụ My Health Declaration.
8. Yêu cầu về nhân thân (Character): trả lời các câu hỏi về hành vi; có thể phải nộp lý lịch tư pháp (police check).
9. Nộp hồ sơ trực tuyến qua ImmiAccount trên website Bộ Nội vụ Úc (Department of Home Affairs).
10. Kiểm tra các yêu cầu về đi lại hiện hành trước khi khởi hành.

Giấy tờ cần chuẩn bị: thư mời nhập học, CoE, chứng chỉ tiếng Anh, bằng chứng tài chính, bằng chứng OSHC, kết quả khám sức khoẻ, lý lịch tư pháp/thư giới thiệu nhân thân (nếu được yêu cầu), hộ chiếu còn hiệu lực. Hồ sơ cũng cần dữ liệu sinh trắc học (biometrics).
- Có thể nhờ đại lý di trú đã đăng ký (registered migration agent) hỗ trợ, nhưng không bắt buộc.
- Đại diện tuyển sinh giáo dục (education agent) không được tư vấn di trú trừ khi họ cũng là registered migration agent.

## 3. Yêu cầu Sinh viên chân chính (Genuine Student)
- Áp dụng cho hồ sơ visa sinh viên nộp từ ngày 23/03/2024.
- Người nộp đơn phải là người thực sự muốn nhập cảnh và ở lại Úc với tư cách sinh viên, và phải chứng minh hiểu rằng học tập tại Úc là lý do chính để xin visa.

## 4. Yêu cầu tiếng Anh
- Từ ngày 07/08/2025 có 9 bài thi tiếng Anh được chấp nhận cho hồ sơ visa sinh viên:
  Cambridge C1 Advanced; CELPIP General; IELTS Academic; IELTS General Training; LANGUAGECERT Academic; Michigan English Test (MET); Occupational English Test (OET); PTE Academic; TOEFL iBT.
- TOEFL iBT: phải chọn "TOEFL iBT for Australia" (thang điểm 0–120). Điểm TOEFL iBT yêu cầu đã tăng từ 64 lên 67.
- Các bài thi trực tuyến tại nhà (online/at-home) như TOEFL iBT Special Home Edition, OET@Home, IELTS Indicator và IELTS Online KHÔNG được chấp nhận.
- Điểm IELTS tối thiểu cho visa sinh viên đã tăng từ 5,5 lên 6,0 (hoặc tương đương) với hồ sơ nộp từ 23/03/2024. Với sinh viên học khoá tiếng Anh ELICOS trước khoá chính, mức tối thiểu tăng từ IELTS 4,5 lên 5,0 (hoặc tương đương).
- Kết quả thi từ 07/08/2025 trở đi được đánh giá theo tiêu chí mới; kết quả thi từ 06/08/2025 trở về trước được đánh giá theo mức điểm cũ. Một số mức điểm tương đương giữa các bài thi có thể hơi khác nhau.
- Yêu cầu tiếng Anh cụ thể còn có thể khác nhau tuỳ cơ sở đào tạo.

## 5. Tài chính
- Cần chứng minh khoản tiết kiệm tối thiểu 29.710 AUD để trang trải chi phí liên quan đến khoá học như đi lại, học phí và tiền thuê nhà.
- Yêu cầu về bằng chứng tài chính thay đổi tuỳ hoàn cảnh từng người. Bộ Nội vụ Úc dùng "khoá học chính" (main course) để xác định yêu cầu, và có thể yêu cầu cung cấp bằng chứng trong quá trình xét hồ sơ.

## 6. Visa sinh viên (subclass 500) cho phép gì
- Học tại một cơ sở đào tạo của Úc; đưa thành viên gia đình đi cùng (vợ/chồng, con, hoặc con của vợ/chồng).
- Ở lại Úc trong thời gian khoá học, tối đa 5 năm; được ra vào nước Úc.
- Các loại hình học tập đủ điều kiện: giáo dục đại học; giáo dục nghề và đào tạo (VET); khoá dự bị/chuyển tiếp (pathway); khoá tiếng Anh ELICOS; tiểu học và trung học; chương trình trao đổi trung học; nghiên cứu sau đại học; khoá không cấp bằng (Study Abroad và Exchange); sinh viên theo học bổng chính phủ (DFAT hoặc Bộ Quốc phòng).

## 7. Quyền đi làm
- Trong thời gian học: tối đa 48 giờ mỗi hai tuần (tính cả giai đoạn thi). Giới hạn 48 giờ cũng áp dụng trước khi khoá học bắt đầu.
- Trong các kỳ nghỉ theo lịch của khoá học: không giới hạn giờ làm.
- Sau khi kết thúc khoá học: không giới hạn giờ làm nếu visa còn hiệu lực.
- Sinh viên Thạc sĩ nghiên cứu (Masters by Research) và Tiến sĩ: không bị giới hạn giờ làm.
- Vi phạm giới hạn giờ làm có thể dẫn đến bị huỷ visa.

## 8. Lệ phí visa
- Từ ngày 01/07/2026: lệ phí tối thiểu 2.500 AUD cho mỗi hồ sơ. Có miễn giảm cho một số đối tượng đủ điều kiện.

## 9. Thời gian xét hồ sơ
- Thời gian xét visa khác nhau tuỳ từng người; cần xem thông tin hiện hành trên website Bộ Nội vụ Úc.
- Nên nộp hồ sơ sớm. Chương trình "Check Twice, Submit Once" có các mẹo giúp xử lý nhanh hơn.

## 10. Điều kiện bắt buộc khi giữ visa
- Báo địa chỉ cư trú cho cơ sở đào tạo trong vòng 7 ngày kể từ khi đến Úc.
- Duy trì ghi danh khoá học, đi học đầy đủ và đạt tiến độ học tập.
- Báo cho cơ sở đào tạo nếu bị ốm hoặc có vấn đề ảnh hưởng đến việc đi học.
- Duy trì bảo hiểm y tế phù hợp trong suốt thời gian ở Úc.
- Không ở quá hạn visa.
- Tuân thủ giới hạn giờ làm việc.
- Có thể dùng hệ thống VEVO (Visa Entitlement Verification Online) để kiểm tra điều kiện visa.

## 11. Ghép nhiều khoá học (course packaging)
- Có thể nộp một hồ sơ cho nhiều khoá học nếu có sự tiếp nối rõ ràng; mỗi khoá cần một CoE riêng.
- Khoá cuối cùng được coi là khoá "chính" khi xét visa.
- Khoảng cách giữa các khoá phải dưới hai tháng dương lịch. Cho phép khoảng nghỉ dài hơn (3–4 tháng) nếu khoá đầu kết thúc vào tháng 11 và khoá sau bắt đầu vào tháng 2.

## 12. Nộp hồ sơ trong và ngoài nước Úc
- Nộp từ ngoài nước Úc (offshore): dành cho người có ý định học tập thật sự; có thể nộp từ bất kỳ nơi nào ngoài nước Úc.
- Nộp từ trong nước Úc (onshore): người đang giữ visa Visitor, Temporary Graduate hoặc Maritime Crew KHÔNG được nộp. Người đang giữ visa sinh viên có thể nộp thêm visa để học tiếp. Phải có CoE hợp lệ khi nộp hồ sơ.

## 13. Các trường hợp đặc biệt
- Chuyển xuống bậc thấp hơn trong khung AQF: phải nộp hồ sơ visa mới, kể cả khi visa hiện tại còn hạn.
- Chuyển trường ở cùng bậc học: không cần visa mới nếu visa hiện tại còn bao phủ thời gian học còn lại.
- Visa hết hạn hoặc sắp hết hạn: hậu quả nghiêm trọng, gồm bị giam giữ và buộc xuất cảnh; có dịch vụ Status Resolution Support Service hỗ trợ người không có tư cách cư trú hợp pháp.

## 14. NHỮNG ĐIỀU NỘI DUNG NÀY KHÔNG ĐỀ CẬP
Nội dung trên không có thông tin về: điểm chuẩn/điều kiện đầu vào (GPA, điểm học bạ) của từng trường hoặc ngành; học phí từng trường; học bổng; chi phí sinh hoạt chi tiết theo thành phố; mức chứng minh tài chính bổ sung cho người phụ thuộc; mức điểm tối thiểu từng phần của từng bài thi; thời gian xét visa cụ thể; thủ tục xin ở lại làm việc sau tốt nghiệp (visa Temporary Graduate); visa du lịch; và các nước khác ngoài Úc.
`;
