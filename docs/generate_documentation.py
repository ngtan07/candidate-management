# -*- coding: utf-8 -*-
import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

DOCX_PATH = r"d:\01.FU\SEM 7\SDN392\00.project\candidate-managerment\docs\TalentPulse_Project_Documentation.docx"
MD_PATH = r"d:\01.FU\SEM 7\SDN392\00.project\candidate-managerment\docs\TalentPulse_Project_Documentation.md"
DIAGRAMS_DIR = r"d:\01.FU\SEM 7\SDN392\00.project\candidate-managerment\docs\diagrams"

# Color constants
COLOR_TEAL_DARK = RGBColor(15, 118, 110)    # #0F766E
COLOR_SLATE_DARK = RGBColor(15, 23, 42)     # #0F172A
COLOR_SLATE_MID = RGBColor(51, 65, 85)      # #334155
COLOR_MUTED = RGBColor(100, 116, 139)       # #64748B

HEX_TEAL_HEADER = "0F766E"
HEX_ROW_ALT = "F8FAFC"
HEX_BORDER = "CBD5E1"
HEX_CODE_BG = "F1F5F9"

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=160, right=160):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color=HEX_BORDER, sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:left w:val="none"/>
            <w:right w:val="none"/>
            <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideV w:val="none"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def format_table(table, col_widths=None):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table)
    
    # Header row formatting
    header_tr = table.rows[0]._tr.get_or_add_trPr()
    header_tr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))
    
    for cell in table.rows[0].cells:
        set_cell_background(cell, HEX_TEAL_HEADER)
        set_cell_margins(cell, top=140, bottom=140, left=160, right=160)
        for p in cell.paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in p.runs:
                run.font.name = "Times New Roman"
                run.font.size = Pt(9.5)
                run.font.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)
                
    # Data rows formatting
    for r_idx, row in enumerate(table.rows[1:], start=1):
        trPr = row._tr.get_or_add_trPr()
        trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
        
        bg_color = HEX_ROW_ALT if r_idx % 2 == 1 else "FFFFFF"
        for cell in row.cells:
            set_cell_background(cell, bg_color)
            set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            for p in cell.paragraphs:
                for run in p.runs:
                    run.font.name = "Times New Roman"
                    run.font.size = Pt(9)
                    run.font.color.rgb = COLOR_SLATE_DARK

    if col_widths:
        for row in table.rows:
            for i, w in enumerate(col_widths):
                if i < len(row.cells):
                    row.cells[i].width = Inches(w)

def add_heading_1(doc, text):
    h = doc.add_heading(text, level=1)
    h.paragraph_format.space_before = Pt(18)
    h.paragraph_format.space_after = Pt(8)
    h.paragraph_format.keep_with_next = True
    for r in h.runs:
        r.font.name = "Times New Roman"
        r.font.size = Pt(15)
        r.font.bold = True
        r.font.color.rgb = COLOR_TEAL_DARK
    return h

def add_heading_2(doc, text):
    h = doc.add_heading(text, level=2)
    h.paragraph_format.space_before = Pt(13)
    h.paragraph_format.space_after = Pt(5)
    h.paragraph_format.keep_with_next = True
    for r in h.runs:
        r.font.name = "Times New Roman"
        r.font.size = Pt(13)
        r.font.bold = True
        r.font.color.rgb = COLOR_SLATE_DARK
    return h

def add_heading_3(doc, text):
    h = doc.add_heading(text, level=3)
    h.paragraph_format.space_before = Pt(9)
    h.paragraph_format.space_after = Pt(3)
    h.paragraph_format.keep_with_next = True
    for r in h.runs:
        r.font.name = "Times New Roman"
        r.font.size = Pt(11.5)
        r.font.bold = True
        r.font.color.rgb = COLOR_SLATE_MID
    return h

def add_p(doc, text, bold=False, italic=False, space_after=6):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.25
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    run = p.add_run(text)
    run.font.name = "Times New Roman"
    run.font.size = Pt(11)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = COLOR_SLATE_DARK
    return p

def add_bullet(doc, title, text):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(3.5)
    p.paragraph_format.line_spacing = 1.2
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    r_title = p.add_run(title)
    r_title.font.name = "Times New Roman"
    r_title.font.size = Pt(10.5)
    r_title.font.bold = True
    r_title.font.color.rgb = COLOR_SLATE_DARK
    
    r_text = p.add_run(" " + text)
    r_text.font.name = "Times New Roman"
    r_text.font.size = Pt(10.5)
    r_text.font.color.rgb = COLOR_SLATE_MID
    return p

def add_image_with_caption(doc, img_rel_path, caption_text, width=Inches(6.2)):
    full_path = os.path.join(DIAGRAMS_DIR, img_rel_path)
    if os.path.exists(full_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(3)
        run_img = p_img.add_run()
        run_img.add_picture(full_path, width=width)
        
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(2)
        p_cap.paragraph_format.space_after = Pt(12)
        r_cap = p_cap.add_run(caption_text)
        r_cap.font.name = "Times New Roman"
        r_cap.font.size = Pt(9.5)
        r_cap.font.italic = True
        r_cap.font.color.rgb = COLOR_MUTED
    else:
        add_p(doc, f"[Image placeholder: {caption_text} - File: {img_rel_path}]", italic=True)

def add_code_block(doc, code_text):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, HEX_CODE_BG)
    set_cell_margins(cell, top=80, bottom=80, left=140, right=140)
    set_table_borders(tbl, color="E2E8F0", sz="4", val="single")
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.15
    run = p.add_run(code_text)
    run.font.name = "Consolas"
    run.font.size = Pt(8.5)
    run.font.color.rgb = COLOR_SLATE_DARK
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def add_page_number_to_section(section):
    footer = section.footer
    p = footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = p.add_run("Trang ")
    run.font.name = "Times New Roman"
    run.font.size = Pt(9.5)
    run.font.color.rgb = COLOR_MUTED
    
    fldChar1 = parse_xml(r'<w:fldChar %s w:fldCharType="begin"/>' % nsdecls('w'))
    instrText = parse_xml(r'<w:instrText %s xml:space="preserve"> PAGE </w:instrText>' % nsdecls('w'))
    fldChar2 = parse_xml(r'<w:fldChar %s w:fldCharType="separate"/>' % nsdecls('w'))
    fldChar3 = parse_xml(r'<w:fldChar %s w:fldCharType="end"/>' % nsdecls('w'))
    run._r.append(fldChar1)
    run._r.append(instrText)
    run._r.append(fldChar2)
    run._r.append(fldChar3)

def create_full_documentation():
    doc = docx.Document()
    
    # Page setup: A4, 2.0 cm margins
    for section in doc.sections:
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)
        section.top_margin = Inches(0.79)
        section.bottom_margin = Inches(0.79)
        section.left_margin = Inches(0.79)
        section.right_margin = Inches(0.79)
        add_page_number_to_section(section)

    print("Generating Cover Page...")
    # ==========================================================
    # COVER PAGE
    # ==========================================================
    p_uni = doc.add_paragraph()
    p_uni.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_uni.paragraph_format.space_before = Pt(20)
    p_uni.paragraph_format.space_after = Pt(2)
    r = p_uni.add_run("BỘ GIÁO DỤC VÀ ĐÀO TẠO — TRƯỜNG ĐẠI HỌC FPT")
    r.font.name = "Times New Roman"
    r.font.size = Pt(13)
    r.font.bold = True
    r.font.color.rgb = COLOR_SLATE_DARK

    p_fac = doc.add_paragraph()
    p_fac.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_fac.paragraph_format.space_after = Pt(30)
    r = p_fac.add_run("KHOA CÔNG NGHỆ THÔNG TIN")
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.font.bold = True
    r.font.color.rgb = COLOR_TEAL_DARK

    # Decorative line
    p_line = doc.add_paragraph()
    p_line.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_line.paragraph_format.space_after = Pt(50)
    r = p_line.add_run("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    r.font.color.rgb = COLOR_TEAL_DARK

    p_report = doc.add_paragraph()
    p_report.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_report.paragraph_format.space_after = Pt(10)
    r = p_report.add_run("BÁO CÁO ĐỒ ÁN MÔN HỌC")
    r.font.name = "Times New Roman"
    r.font.size = Pt(15)
    r.font.bold = True
    r.font.color.rgb = COLOR_SLATE_MID

    p_course = doc.add_paragraph()
    p_course.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_course.paragraph_format.space_after = Pt(25)
    r = p_course.add_run("MÔN HỌC: SDN392 — CLOUD-BASED SYSTEM DEVELOPMENT")
    r.font.name = "Times New Roman"
    r.font.size = Pt(13)
    r.font.bold = True
    r.font.color.rgb = COLOR_TEAL_DARK

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(12)
    r = p_title.add_run("TALENTPULSE")
    r.font.name = "Times New Roman"
    r.font.size = Pt(28)
    r.font.bold = True
    r.font.color.rgb = COLOR_TEAL_DARK

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(80)
    r = p_sub.add_run("HỆ THỐNG QUẢN LÝ TUYỂN DỤNG VÀ THEO DÕI HỒ SƠ ỨNG VIÊN\n(RECRUITMENT MANAGEMENT & CANDIDATE TRACKING SYSTEM)")
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.font.italic = True
    r.font.color.rgb = COLOR_SLATE_MID

    # Student & Lecturer Info Table
    info_table = doc.add_table(rows=4, cols=2)
    info_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(info_table, color="FFFFFF") # Borderless
    info_data = [
        ("Sinh viên thực hiện:", "HE194481"),
        ("Mã học kỳ / Khóa:", "Semester 7 — Fall 2026"),
        ("Giảng viên hướng dẫn:", "[Giảng viên phụ trách môn SDN392]"),
        ("Chuyên ngành:", "Kỹ thuật Phần mềm (Software Engineering)")
    ]
    for idx, (label, val) in enumerate(info_data):
        row = info_table.rows[idx]
        cell_lbl, cell_val = row.cells[0], row.cells[1]
        cell_lbl.width = Inches(2.5)
        cell_val.width = Inches(3.5)
        
        p0 = cell_lbl.paragraphs[0]
        p0.alignment = WD_ALIGN_PARAGRAPH.LEFT
        r0 = p0.add_run(label)
        r0.font.name = "Times New Roman"
        r0.font.size = Pt(11)
        r0.font.bold = True
        r0.font.color.rgb = COLOR_SLATE_DARK
        
        p1 = cell_val.paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.LEFT
        r1 = p1.add_run(val)
        r1.font.name = "Times New Roman"
        r1.font.size = Pt(11)
        r1.font.color.rgb = COLOR_SLATE_MID

    p_loc = doc.add_paragraph()
    p_loc.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_loc.paragraph_format.space_before = Pt(60)
    r = p_loc.add_run("Hà Nội, Tháng 11 Năm 2026")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)
    r.font.color.rgb = COLOR_MUTED

    doc.add_page_break()

    print("Generating Table of Contents & Introduction...")
    # ==========================================================
    # TABLE OF CONTENTS
    # ==========================================================
    add_heading_1(doc, "MỤC LỤC")
    p_toc_note = doc.add_paragraph()
    p_toc_note.paragraph_format.space_after = Pt(10)
    r_toc = p_toc_note.add_run("Dưới đây là cấu trúc các chương và phân mục của báo cáo kỹ thuật dự án TalentPulse:")
    r_toc.font.name = "Times New Roman"
    r_toc.font.size = Pt(11)
    r_toc.font.italic = True

    toc_items = [
        ("CHƯƠNG 1. TỔNG QUAN DỰ ÁN", "3"),
        ("   1.1 Đặt vấn đề và Bối cảnh thực tiễn", "3"),
        ("   1.2 Mục tiêu của dự án", "3"),
        ("   1.3 Phạm vi hệ thống", "4"),
        ("   1.4 Đối tượng sử dụng và Phân quyền", "4"),
        ("   1.5 Ngăn xếp công nghệ chi tiết (Technology Stack)", "5"),
        ("CHƯƠNG 2. PHÂN TÍCH YÊU CẦU HỆ THỐNG", "6"),
        ("   2.1 Yêu cầu chức năng theo từng Actor", "6"),
        ("   2.2 Sơ đồ Use Case tổng quát (Use Case Diagram)", "8"),
        ("   2.3 Đặc tả Use Case chi tiết (10 Use Cases trọng tâm)", "9"),
        ("   2.4 Yêu cầu phi chức năng (Non-Functional Requirements)", "14"),
        ("CHƯƠNG 3. THIẾT KẾ KIẾN TRÚC HỆ THỐNG", "16"),
        ("   3.1 Kiến trúc tổng thể hệ thống (3-Tier Decoupled Architecture)", "16"),
        ("   3.2 Thiết kế kiến trúc Backend (Layered Architecture)", "17"),
        ("   3.3 Thiết kế kiến trúc Frontend (Component & Context Architecture)", "18"),
        ("   3.4 Thiết kế Xác thực và Phân quyền (JWT & RBAC Architecture)", "19"),
        ("CHƯƠNG 4. THIẾT KẾ CƠ SỞ DỮ LIỆU", "21"),
        ("   4.1 Tổng quan cơ sở dữ liệu MongoDB", "21"),
        ("   4.2 Đặc tả chi tiết các Mongoose Models & Collections", "21"),
        ("   4.3 Sơ đồ quan hệ thực thể (Entity Relationship Diagram - ERD)", "26"),
        ("   4.4 Định nghĩa các trạng thái và chuyển đổi vòng đời", "27"),
        ("CHƯƠNG 5. THIẾT KẾ VÀ HIỆN THỰC RESTFUL API", "29"),
        ("   5.1 Tổng quan chuẩn RESTful API và Quy ước thiết kế", "29"),
        ("   5.2 Bảng đặc tả chi tiết toàn bộ Endpoint hệ thống", "29"),
        ("   5.3 Ví dụ Request và Response JSON tiêu biểu", "33"),
        ("   5.4 Cơ chế Kiểm tra dữ liệu (Validation) và Xử lý lỗi tập trung", "36"),
        ("CHƯƠNG 6. CÁC LUỒNG NGHIỆP VỤ HỆ THỐNG", "38"),
        ("   6.1 Luồng Đăng ký và Đăng nhập Ứng viên", "38"),
        ("   6.2 Luồng Đăng ký Nhà tuyển dụng và Phê duyệt bởi Admin", "38"),
        ("   6.3 Luồng Tạo, Lưu nháp và Xuất bản Tin tuyển dụng", "39"),
        ("   6.4 Luồng Tìm kiếm việc làm và Nộp hồ sơ ứng tuyển", "40"),
        ("   6.5 Luồng Sàng lọc hồ sơ CV của Nhà tuyển dụng", "41"),
        ("   6.6 Luồng Lên lịch và Đánh giá phỏng vấn trực tiếp", "42"),
        ("   6.7 Luồng Quản trị và Kiểm duyệt tài khoản Recruiter", "44"),
        ("   6.8 Luồng Kiểm duyệt và Ẩn/Hiện tin việc làm", "44"),
        ("CHƯƠNG 7. THIẾT KẾ GIAO DIỆN VÀ HƯỚNG DẪN SỬ DỤNG", "45"),
        ("   7.1 Hướng dẫn dành cho Ứng viên (Candidate User Guide)", "45"),
        ("   7.2 Hướng dẫn dành cho Nhà tuyển dụng (Recruiter User Guide)", "47"),
        ("   7.3 Hướng dẫn dành cho Quản trị viên (Admin User Guide)", "49"),
        ("   7.4 Thiết kế hệ thống giao diện và trải nghiệm người dùng (UI/UX)", "50"),
        ("CHƯƠNG 8. KIỂM THỬ HỆ THỐNG", "52"),
        ("   8.1 Tổng quan chiến lược kiểm thử", "52"),
        ("   8.2 Bảng Test Cases chi tiết và kết quả thực nghiệm", "52"),
        ("   8.3 Kiểm thử bảo mật và Kiểm soát truy cập (Security Testing)", "56"),
        ("   8.4 Các hạn chế và chức năng đã ghi nhận", "57"),
        ("CHƯƠNG 9. HƯỚNG DẪN CÀI ĐẶT VÀ TRIỂN KHAI", "58"),
        ("   9.1 Yêu cầu hệ thống và Tiền đề kỹ thuật", "58"),
        ("   9.2 Bảng cấu hình biến môi trường chi tiết (.env)", "58"),
        ("   9.3 Cài đặt và Khởi chạy Backend", "60"),
        ("   9.4 Cài đặt và Khởi chạy Frontend", "60"),
        ("   9.5 Khởi tạo cơ sở dữ liệu MongoDB", "61"),
        ("   9.6 Các lưu ý triển khai môi trường Production", "61"),
        ("CHƯƠNG 10. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN", "63"),
        ("   10.1 Kết quả đạt được của dự án", "63"),
        ("   10.2 Các hạn chế hiện tại của hệ thống", "63"),
        ("   10.3 Định hướng phát triển trong tương lai", "64"),
    ]

    for item, p_num in toc_items:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        r_item = p.add_run(item)
        r_item.font.name = "Times New Roman"
        r_item.font.size = Pt(10)
        if item.startswith("CHƯƠNG"):
            r_item.font.bold = True
            r_item.font.color.rgb = COLOR_TEAL_DARK
        else:
            r_item.font.color.rgb = COLOR_SLATE_MID

    doc.add_page_break()

    print("Generating Chapter 1: Project Overview...")
    # ==========================================================
    # CHAPTER 1: TỔNG QUAN DỰ ÁN
    # ==========================================================
    add_heading_1(doc, "CHƯƠNG 1. TỔNG QUAN DỰ ÁN")

    add_heading_2(doc, "1.1 Đặt vấn đề và Bối cảnh thực tiễn")
    add_p(doc, "Trong thời đại chuyển đổi số mạnh mẽ, hoạt động tuyển dụng nhân sự đóng vai trò then chốt quyết định sự thành bại và sức cạnh tranh của các doanh nghiệp. Tuy nhiên, quy trình tuyển dụng truyền thống thông qua email, bảng tính thủ công hoặc các kênh trao đổi phân tán đang bộc lộ nhiều hạn chế nghiêm trọng:")
    add_bullet(doc, "Thất lạc và phân tán hồ sơ:", "CV của ứng viên gửi qua nhiều kênh email, tin nhắn dễ bị bỏ sót, không có cơ chế quản lý vòng đời hồ sơ tập trung.")
    add_bullet(doc, "Thiếu minh bạch và độ trễ phản hồi:", "Ứng viên thường xuyên rơi vào tình trạng 'mất liên lạc' sau khi nộp hồ sơ, không nắm bắt được tiến độ xem xét, lịch phỏng vấn hay kết quả đánh giá.")
    add_bullet(doc, "Quy trình sàng lọc thủ công, tốn kém thời gian:", "Nhà tuyển dụng mất nhiều giờ đồng hồ để mở từng tệp CV, ghi chú nhận xét rời rạc trên giấy hoặc file văn bản ngoài, dẫn đến khó khăn trong việc phối hợp nhóm tuyển dụng.")
    add_bullet(doc, "Nguy cơ rò rỉ dữ liệu cá nhân:", "Việc chia sẻ file CV tự do qua các kênh không mã hóa vi phạm các quy định bảo mật thông tin cá nhân của ứng viên.")
    add_p(doc, "Trước thực trạng đó, dự án TalentPulse được phát triển nhằm mục tiêu xây dựng một nền tảng quản lý tuyển dụng (Recruitment Management System - RMS) hiện đại, minh bạch và toàn diện, tối ưu hóa trải nghiệm cho cả Ứng viên (Candidate), Nhà tuyển dụng (Recruiter) và Quản trị viên nền tảng (Admin).")

    add_heading_2(doc, "1.2 Mục tiêu của dự án")
    add_p(doc, "Dự án hướng tới các mục tiêu kỹ thuật và nghiệp vụ cụ thể sau:")
    add_bullet(doc, "Xây dựng hệ thống SaaS tuyển dụng hoàn chỉnh:", "Cung cấp cổng thông tin chuyên biệt cho từng vai trò với giao diện tối ưu theo chuẩn UI/UX hiện đại (Deep Teal & Navy palette).")
    add_bullet(doc, "Tự động hóa luồng sàng lọc ứng viên 6 giai đoạn:", "Thiết lập quy trình tuyển dụng chuẩn hóa từ khi nộp đơn (Applied), duyệt CV (Passed CV), chờ phỏng vấn (Waiting Interview), đánh giá phỏng vấn (Interviewed), đến quyết định tuyển dụng (Passed/Offer).")
    add_bullet(doc, "Tích hợp giải pháp xem và lưu trữ CV an toàn:", "Áp dụng cơ chế lưu trữ đám mây Cloudinary Authenticated Storage, cung cấp khả năng xem trước CV dạng PDF trực tiếp trên trình duyệt bằng Signed URL tạm thời và tải về an toàn mà không để lộ khóa API bí mật.")
    add_bullet(doc, "Bộ lọc tìm việc thông minh chuẩn TopCV:", "Cung cấp trải nghiệm tìm kiếm việc làm chuyên nghiệp với bộ lọc đa tiêu chí (mức lương min-max chồng chéo, loại hình làm việc, cấp bậc, ngành nghề).")
    add_bullet(doc, "Đảm bảo tính bảo mật và toàn vẹn dữ liệu:", "Kiểm soát truy cập nghiêm ngặt bằng JWT trong HTTP-only Cookie, phân quyền theo vai trò (RBAC), kiểm duyệt tính hợp pháp của doanh nghiệp trước khi cho phép đăng tuyển.")

    add_heading_2(doc, "1.3 Phạm vi hệ thống")
    add_p(doc, "Phạm vi chức năng đã được hiện thực đầy đủ trong mã nguồn dự án bao gồm:")
    add_bullet(doc, "Phân hệ Ứng viên (Candidate Portal):", "Đăng ký, xác thực đăng nhập, quản lý hồ sơ cá nhân, tìm kiếm việc làm với bộ lọc thông minh, nộp đơn ứng tuyển kèm tải file CV (PDF/DOC/DOCX), theo dõi trạng thái đơn nộp theo thời gian thực, xem chi tiết lịch phỏng vấn.")
    add_bullet(doc, "Phân hệ Nhà tuyển dụng (Recruiter Portal):", "Đăng ký doanh nghiệp với giấy phép kinh doanh, quản trị tin tuyển dụng (tạo mới, sửa nháp, xuất bản, đóng tin), quản lý ứng viên theo 6 tab chuẩn hóa, xem trước CV trực tuyến, lên lịch phỏng vấn đơn hoặc hàng loạt (Bulk Scheduling), đánh giá phỏng vấn tại trang riêng 2 cột, đưa ra quyết định nhận hoặc loại ứng viên.")
    add_bullet(doc, "Phân hệ Quản trị viên (Admin Console):", "Xét duyệt đăng ký nhà tuyển dụng (phê duyệt hoặc từ chối kèm lý do văn bản), đình chỉ hoặc kích hoạt lại tài khoản doanh nghiệp, giám sát danh mục việc làm toàn sàn, ẩn hoặc khôi phục hiển thị tin tuyển dụng.")
    add_p(doc, "Các tính năng nằm ngoài phạm vi hiện tại (Out of Scope): Tổ chức phòng phỏng vấn video trực tuyến tích hợp sẵn (WebRTC), cổng thanh toán phí đăng tin tuyển dụng, và bài test đánh giá năng lực tự động trực tuyến.")

    add_heading_2(doc, "1.4 Đối tượng sử dụng và Phân quyền")
    add_p(doc, "Hệ thống phân định rõ ràng 3 nhóm tác nhân chính:")
    add_bullet(doc, "Ứng viên (CANDIDATE):", "Người tìm kiếm cơ hội việc làm, có quyền tra cứu tin tuyển dụng mở, nộp đơn ứng tuyển, quản lý hồ sơ cá nhân và theo dõi kết quả tuyển dụng của bản thân.")
    add_bullet(doc, "Nhà tuyển dụng (RECRUITER):", "Đại diện doanh nghiệp, sau khi được Admin phê duyệt tài khoản, có quyền đăng tin, quản lý hồ sơ ứng viên nộp vào tin của mình, lên lịch và chấm điểm phỏng vấn.")
    add_bullet(doc, "Quản trị viên (ADMIN):", "Người chịu trách nhiệm vận hành nền tảng, kiểm soát tính xác thực của các doanh nghiệp tham gia, điều phối và đảm bảo chất lượng nội dung việc làm trên hệ thống.")

    add_heading_2(doc, "1.5 Ngăn xếp công nghệ chi tiết (Technology Stack)")
    add_p(doc, "Toàn bộ hệ thống được xây dựng trên nền tảng công nghệ full-stack JavaScript hiện đại, đảm bảo hiệu năng cao, khả năng mở rộng linh hoạt và tuân thủ các chuẩn công nghiệp:")

    tech_table = doc.add_table(rows=1, cols=4)
    tech_table.rows[0].cells[0].paragraphs[0].text = "Tầng kiến trúc"
    tech_table.rows[0].cells[1].paragraphs[0].text = "Công nghệ / Thư viện"
    tech_table.rows[0].cells[2].paragraphs[0].text = "Phiên bản thực tế"
    tech_table.rows[0].cells[3].paragraphs[0].text = "Mục đích sử dụng trong TalentPulse"

    tech_data = [
        ("Frontend Framework", "React SPA", "v18.3.1", "Xây dựng giao diện người dùng đơn trang, component hóa và tối ưu re-render"),
        ("Build Tool", "Vite", "v6.0.1", "Đóng gói mã nguồn nhanh, Hot Module Replacement (HMR) và tối ưu build production"),
        ("Frontend Routing", "React Router DOM", "v6.28.0", "Điều hướng trang, bảo vệ route bằng ProtectedRoute và phân quyền theo Role"),
        ("CSS Framework", "Tailwind CSS", "v3.4.17", "Xây dựng giao diện Responsive, thiết kế hệ màu Deep Teal (#0F766E) và Slate"),
        ("Iconography", "Lucide React", "v0.468.0", "Hệ thống icon vector nhất quán cho bảng điều khiển, trạng thái và hành động"),
        ("HTTP Client", "Axios", "v1.7.9", "Giao tiếp RESTful API, tự động đính kèm cookie và xử lý phản hồi Blob dữ liệu"),
        ("Backend Runtime", "Node.js", "v24.22.1 / v18+", "Môi trường thực thi JavaScript bất đồng bộ phía máy chủ (ES Modules)"),
        ("Web Framework", "Express", "v5.3.0", "Xây dựng RESTful API Engine, xử lý Middleware, routing và request validation"),
        ("Database Engine", "MongoDB", "v6.0+ (Driver 9.11.4)", "Cơ sở dữ liệu NoSQL lưu trữ tài liệu BSON, đánh chỉ mục Compound Indexes"),
        ("Object Modeling", "Mongoose ODM", "v9.11.4", "Định nghĩa Schema, ràng buộc dữ liệu, quan hệ tham chiếu và Aggregation Pipeline"),
        ("Authentication", "jsonwebtoken & bcrypt", "v9.0.2 / v6.0.0", "Băm mật khẩu 10 salt rounds và cấp phát JWT lưu trong HTTP-only Cookie"),
        ("File Storage", "Cloudinary SDK", "v2.11.0", "Lưu trữ tệp CV ứng viên ở chế độ raw/authenticated và tạo Private Download URL"),
        ("File Upload", "Multer", "v2.5.0", "Xử lý multipart/form-data trong bộ nhớ RAM, kiểm tra định dạng và dung lượng CV"),
        ("Job Scheduler", "node-cron", "v4.6.0", "Tác vụ chạy ngầm định kỳ quét và đóng tin tuyển dụng quá hạn tự động mỗi phút"),
        ("API Security", "Helmet & CORS", "v8.3.0 / v2.8.6", "Bảo vệ HTTP headers, cấu hình CSP frame-src cho iframe và giới hạn nguồn truy cập")
    ]

    for row_data in tech_data:
        r = tech_table.add_row()
        for idx, text in enumerate(row_data):
            r.cells[idx].paragraphs[0].text = text

    format_table(tech_table, col_widths=[1.5, 1.8, 1.2, 2.5])

    doc.add_page_break()

    print("Generating Chapter 2: Requirements Analysis...")
    # ==========================================================
    # CHAPTER 2: PHÂN TÍCH YÊU CẦU HỆ THỐNG
    # ==========================================================
    add_heading_1(doc, "CHƯƠNG 2. PHÂN TÍCH YÊU CẦU HỆ THỐNG")

    add_heading_2(doc, "2.1 Yêu cầu chức năng theo từng Actor")
    add_p(doc, "Hệ thống TalentPulse được phân tích và đặc tả chức năng chi tiết cho 3 nhóm tác nhân chính:")

    add_heading_3(doc, "2.1.1 Yêu cầu chức năng đối với Ứng viên (Candidate)")
    add_bullet(doc, "FR-CAN-01 (Đăng ký tài khoản):", "Ứng viên cung cấp họ tên, email, mật khẩu và số điện thoại Việt Nam hợp lệ (định dạng 10 chữ số).")
    add_bullet(doc, "FR-CAN-02 (Xác thực đăng nhập / Đăng xuất):", "Đăng nhập bằng email và mật khẩu; nhận JWT qua HTTP-only cookie; đăng xuất hủy phiên an toàn.")
    add_bullet(doc, "FR-CAN-03 (Tìm kiếm và lọc việc làm):", "Tìm kiếm theo từ khóa tiêu đề, công ty, địa điểm; lọc theo danh mục ngành nghề, hình thức làm việc, cấp bậc kinh nghiệm, và khoảng lương min-max chồng chéo (TopCV UX).")
    add_bullet(doc, "FR-CAN-04 (Xem chi tiết việc làm):", "Xem đầy đủ mô tả công việc, yêu cầu chuyên môn, mức đãi ngộ, hạn nộp hồ sơ và thông tin doanh nghiệp tuyển dụng.")
    add_bullet(doc, "FR-CAN-05 (Nộp hồ sơ ứng tuyển):", "Gửi thông tin liên hệ và tải file CV (PDF, DOC, DOCX dung lượng tối đa 5MB). Hệ thống ngăn chặn nộp trùng lặp vào cùng một công việc.")
    add_bullet(doc, "FR-CAN-06 (Theo dõi đơn ứng tuyển):", "Xem danh sách các đơn đã nộp (My Applications), xem trạng thái xử lý hồ sơ theo thời gian thực và thời điểm cập nhật.")
    add_bullet(doc, "FR-CAN-07 (Xem chi tiết hồ sơ & lịch phỏng vấn):", "Xem lại thông tin đã nộp, xem lịch phỏng vấn (ngày giờ, hình thức Online/Offline, link họp video hoặc địa chỉ văn phòng cụ thể). Tuyệt đối không hiển thị ghi chú nội bộ của nhà tuyển dụng.")
    add_bullet(doc, "FR-CAN-08 (Quản lý hồ sơ cá nhân & Đổi mật khẩu):", "Cập nhật thông tin liên lạc (họ tên, điện thoại, địa chỉ); đổi mật khẩu yêu cầu xác thực mật khẩu hiện tại.")

    add_heading_3(doc, "2.1.2 Yêu cầu chức năng đối với Nhà tuyển dụng (Recruiter)")
    add_bullet(doc, "FR-REC-01 (Đăng ký doanh nghiệp):", "Khai báo tên công ty, mã số thuế/kinh doanh, đường dẫn giấy phép kinh doanh, điện thoại, địa chỉ và chờ phê duyệt từ Admin.")
    add_bullet(doc, "FR-REC-02 (Quản trị tin tuyển dụng):", "Tạo tin mới, lưu bản nháp (Draft), xuất bản tin (Opening), cập nhật tin nháp, đóng tin đang tuyển (Closed), và xóa tin.")
    add_bullet(doc, "FR-REC-03 (Quản lý ứng viên theo 6 giai đoạn):", "Phân loại ứng viên trực quan theo các tab: All (Tất cả), Pending (Chờ duyệt CV), Passed CV (Đã duyệt CV), Waiting Interview (Chờ phỏng vấn), Waiting Result (Chờ kết quả), và Passed (Trúng tuyển).")
    add_bullet(doc, "FR-REC-04 (Xem trước và tải CV an toàn):", "Xem trực tiếp CV định dạng PDF trong trình duyệt qua iframe sử dụng URL ký bảo mật; tải file CV gốc về máy tính.")
    add_bullet(doc, "FR-REC-05 (Sàng lọc hồ sơ CV):", "Chấp nhận CV (chuyển sang PASSED_CV) hoặc Từ chối CV (chuyển sang REJECTED_CV).")
    add_bullet(doc, "FR-REC-06 (Lên lịch phỏng vấn hàng loạt):", "Chọn một hoặc nhiều ứng viên ở tab Passed CV để lên lịch hẹn phỏng vấn (ngày giờ, loại hình Online/Offline, link Google Meet/Zoom hoặc địa chỉ văn phòng). Trạng thái tự động chuyển sang WAITING_INTERVIEW.")
    add_bullet(doc, "FR-REC-07 (Đánh giá phỏng vấn tại trang chuyên dụng):", "Mở trang InterviewEvaluation 2 cột: Cột trái hiển thị hồ sơ ứng viên và nhúng trực tiếp CV PDF; Cột phải hiển thị lịch hẹn và khung ghi chú đánh giá. Khi lưu đánh giá, trạng thái tự động chuyển sang INTERVIEWED (Waiting Result).")
    add_bullet(doc, "FR-REC-08 (Quyết định tuyển dụng cuối cùng):", "Tại tab Waiting Result, nhà tuyển dụng xem lại đánh giá và đưa ra quyết định: Chấp nhận tuyển dụng (PASSED) hoặc Từ chối (REJECTED_INTERVIEW).")

    add_heading_3(doc, "2.1.3 Yêu cầu chức năng đối với Quản trị viên (Admin)")
    add_bullet(doc, "FR-ADM-01 (Xét duyệt hồ sơ Nhà tuyển dụng):", "Xem danh sách các doanh nghiệp chờ duyệt (tab Pending Approvals), xem chi tiết thông tin pháp lý và file giấy phép kinh doanh; thực hiện Phê duyệt (APPROVED) hoặc Từ chối (REJECTED kèm bắt buộc nhập lý do từ chối).")
    add_bullet(doc, "FR-ADM-02 (Quản lý trạng thái tài khoản Recruiter):", "Tra cứu danh sách nhà tuyển dụng theo 4 tab: All, Pending Approvals, Active, Suspended. Thực hiện Đình chỉ (Suspend) hoặc Kích hoạt lại (Reactivate) tài khoản vi phạm.")
    add_bullet(doc, "FR-ADM-03 (Kiểm duyệt danh mục việc làm toàn sàn):", "Xem danh sách tất cả các tin tuyển dụng của mọi doanh nghiệp, kèm số lượng ứng viên thực tế nộp đơn; thực hiện Ẩn tin (Hide - chặn hiển thị phía ứng viên) hoặc Khôi phục tin (Restore).")

    add_heading_2(doc, "2.2 Sơ đồ Use Case tổng quát (Use Case Diagram)")
    add_p(doc, "Hình 2.1 biểu diễn toàn bộ các tác nhân và chức năng cốt lõi được hiện thực trong hệ thống TalentPulse. Hệ thống thể hiện sự phân ranh giới rõ ràng giữa 3 đối tượng người dùng.")
    add_image_with_caption(doc, "use_case_diagram.png", "Hình 2.1: Sơ đồ Use Case tổng quát hệ thống TalentPulse")

    add_heading_2(doc, "2.3 Đặc tả Use Case chi tiết")
    add_p(doc, "Dưới đây là bảng đặc tả chi tiết cho các Use Case trọng tâm của hệ thống:")

    use_cases_data = [
        ("UC01", "Đăng ký & Đăng nhập hệ thống", "Candidate, Recruiter, Admin",
         "Người dùng muốn truy cập vào cổng thông tin tương ứng với vai trò của mình.",
         "Người dùng chưa đăng nhập hệ thống.",
         "1. Người dùng nhập thông tin đăng nhập (Email, Password).\n2. Hệ thống kiểm tra format dữ liệu.\n3. Hệ thống xác thực mật khẩu qua bcrypt.compare().\n4. Hệ thống kiểm tra tài khoản có bị khóa không (isActive).\n5. Nếu là Recruiter, kiểm tra trạng thái duyệt (registrationStatus).\n6. Hệ thống tạo JWT token, ghi vào HTTP-only cookie và trả về thông tin người dùng.\n7. Frontend chuyển hướng người dùng đến Dashboard phù hợp với Role.",
         "• 3a. Email hoặc mật khẩu không chính xác: Báo lỗi 401 Unauthorized.\n• 4a. Tài khoản bị đình chỉ (isActive = false): Báo lỗi tài khoản bị khóa.\n• 5a. Recruiter đang chờ duyệt: Cho phép đăng nhập nhưng hiển thị cảnh báo giới hạn quyền xuất bản tin.",
         "Phiên đăng nhập được thiết lập, cookie lưu trữ an toàn."),

        ("UC02", "Tìm kiếm & Lọc tin tuyển dụng", "Candidate, Public User",
         "Tìm kiếm các cơ hội việc làm phù hợp với tiêu chí cá nhân.",
         "Tin tuyển dụng phải ở trạng thái OPENING, isVisible=true, isDeleted=false, và còn trong hạn nộp hồ sơ.",
         "1. Người dùng nhập từ khóa tìm kiếm (chức danh, công ty, địa điểm).\n2. Người dùng chọn các bộ lọc: Mức lương (preset chips hoặc custom min-max), ngành nghề, hình thức làm việc, cấp bậc.\n3. Frontend gửi request GET /api/jobs với query params.\n4. Backend lọc dữ liệu với điều kiện khoảng lương chồng chéo và mảng đa chọn ($in).\n5. Trả về danh sách công việc kèm thông tin phân trang.\n6. Người dùng xem danh sách và có thể xóa từng chip lọc hoặc bấm 'Clear all'.",
         "• 4a. Không tìm thấy việc làm phù hợp: Hệ thống hiển thị Empty State với nút 'Reset Filters'.",
         "Danh sách việc làm hiển thị chính xác theo tiêu chí lọc."),

        ("UC03", "Nộp đơn ứng tuyển & Upload CV", "Candidate",
         "Ứng viên nộp hồ sơ và tải lên file CV cho một vị trí tuyển dụng cụ thể.",
         "Ứng viên đã đăng nhập với vai trò CANDIDATE. Tin tuyển dụng đang mở và chưa hết hạn.",
         "1. Ứng viên bấm 'Apply for Job' tại trang chi tiết việc làm.\n2. Ứng viên xác nhận thông tin liên hệ (họ tên, email, số điện thoại).\n3. Ứng viên chọn file CV (PDF/DOC/DOCX dung lượng <= 5MB) và bấm 'Submit Application'.\n4. Multer kiểm tra định dạng file và dung lượng.\n5. Middleware tải file CV lên Cloudinary authenticated folder.\n6. Backend tạo bản ghi Application liên kết candidateId và jobId với trạng thái APPLIED.\n7. Trả về thông báo thành công và hiển thị trong My Applications.",
         "• 4a. File sai định dạng hoặc > 5MB: Báo lỗi 400 và hủy request.\n• 6a. Ứng viên đã nộp vào job này trước đó: Báo lỗi 400 trùng lặp hồ sơ.",
         "Bản ghi Application được lưu vào MongoDB; file CV được lưu bảo mật trên Cloudinary."),

        ("UC04", "Quản lý & Xuất bản tin tuyển dụng", "Recruiter",
         "Nhà tuyển dụng tạo mới, lưu nháp hoặc xuất bản tin tuyển dụng lên sàn.",
         "Recruiter đã đăng nhập, tài khoản đang Active và đã được Admin phê duyệt (APPROVED).",
         "1. Recruiter vào menu Manage Jobs -> Post New Job.\n2. Nhập các thông tin bắt buộc: Tiêu đề, danh mục, hình thức làm việc, cấp bậc, địa điểm, mức lương, hạn nộp hồ sơ, mô tả chi tiết.\n3. Recruiter chọn 'Save Draft' hoặc 'Publish Job'.\n4. Backend validate dữ liệu: ngày kết thúc phải sau ngày bắt đầu, lương max >= lương min.\n5. Bản ghi Job được lưu với trạng thái DRAFT hoặc OPENING.\n6. Nếu là OPENING, tin việc làm lập tức hiển thị công khai trên bảng tin ứng viên.",
         "• 2a. Recruiter chưa được Admin duyệt: Báo lỗi 403 không có quyền tạo/xuất bản tin.\n• 4a. Dữ liệu ngày hoặc lương không hợp lệ: Báo lỗi validation cụ thể từng trường.",
         "Tin tuyển dụng được tạo và quản lý trong danh mục của Recruiter."),

        ("UC05", "Sàng lọc hồ sơ CV ứng viên", "Recruiter",
         "Nhà tuyển dụng xem xét hồ sơ ứng viên ở giai đoạn nộp đơn ban đầu.",
         "Recruiter sở hữu tin tuyển dụng tương ứng. Có ứng viên ở trạng thái APPLIED.",
         "1. Recruiter vào trang Applicants của job, chọn tab Pending.\n2. Bấm 'View CV' để xem trước CV trực tiếp trong trình duyệt qua iframe bảo mật.\n3. Đánh giá độ phù hợp của hồ sơ.\n4. Bấm 'Accept CV' để duyệt hồ sơ, hoặc 'Reject CV' để từ chối.\n5. Backend cập nhật trạng thái Application thành PASSED_CV hoặc REJECTED_CV.\n6. Cập nhật statusUpdatedAt và làm mới số lượng đếm tại các tab.",
         "• 2a. CV không tải được: Hiển thị thông báo lỗi và cung cấp nút 'Download CV' trực tiếp.",
         "Hồ sơ chuyển sang trạng thái Passed CV hoặc Rejected CV."),

        ("UC06", "Lên lịch phỏng vấn ứng viên", "Recruiter",
         "Lên lịch hẹn phỏng vấn cho các ứng viên đã vượt qua vòng hồ sơ.",
         "Ứng viên đang ở trạng thái PASSED_CV.",
         "1. Tại tab Passed CV, Recruiter tích chọn một hoặc nhiều ứng viên.\n2. Bấm 'Set Scheduler Interview'.\n3. Điền thông tin lịch hẹn: Ngày phỏng vấn, giờ bắt đầu, giờ kết thúc, hình thức (Online/Offline), Link video họp hoặc Địa chỉ văn phòng.\n4. Bấm 'Schedule candidates'.\n5. Backend tạo bản ghi Interview liên kết với Application.\n6. Cập nhật trạng thái Application sang WAITING_INTERVIEW.",
         "• 3a. Giờ kết thúc <= giờ bắt đầu: Báo lỗi thời gian không hợp lệ.\n• 3b. Thiếu meeting URL cho phỏng vấn Online: Báo lỗi yêu cầu link họp.",
         "Ứng viên chuyển sang trạng thái Waiting Interview, hiển thị lịch hẹn chi tiết."),

        ("UC07", "Đánh giá phỏng vấn & Lưu Notes", "Recruiter",
         "Chấm điểm, ghi chép nhận xét phỏng vấn tại trang đánh giá chuyên dụng.",
         "Ứng viên đang ở trạng thái WAITING_INTERVIEW và đã có lịch phỏng vấn.",
         "1. Tại tab Waiting Interview, Recruiter bấm nút 'Interview' tại hàng ứng viên.\n2. Hệ thống mở trang InterviewEvaluation (/recruiter/applications/:id/evaluate).\n3. Recruiter xem song song: Thông tin ứng viên + CV nhúng (iframe) ở cột trái; Lịch hẹn + Khung ghi chú ở cột phải.\n4. Recruiter nhập nhận xét, đánh giá chuyên môn, kỹ năng mềm vào khung Notes.\n5. Bấm 'Save Notes & Move to Waiting Result'.\n6. Backend lưu ghi chú vào model Interview, tự động cập nhật trạng thái Application sang INTERVIEWED.\n7. Ứng viên được chuyển sang tab Waiting Result.",
         "• 4a. Khung ghi chú để trống: Yêu cầu nhập nhận xét trước khi chuyển giai đoạn.",
         "Đơn ứng tuyển chuyển sang INTERVIEWED; ghi chú đánh giá được lưu an toàn."),

        ("UC08", "Ra quyết định tuyển dụng cuối cùng", "Recruiter",
         "Quyết định đưa ra lời mời nhận việc (Offer) hoặc từ chối sau phỏng vấn.",
         "Ứng viên đang ở trạng thái INTERVIEWED (tab Waiting Result).",
         "1. Recruiter truy cập tab Waiting Result.\n2. Xem lại nhận xét đánh giá qua link 'Evaluation'.\n3. Bấm 'Accept' (Chấp nhận tuyển dụng) hoặc 'Reject' (Từ chối sau phỏng vấn).\n4. Backend cập nhật trạng thái thành PASSED hoặc REJECTED_INTERVIEW.\n5. Nếu PASSED, ứng viên chuyển vào tab Passed (danh sách trúng tuyển).",
         "• Không có ngoại lệ kỹ thuật, giao diện hỗ trợ thao tác nhanh 1 chạm.",
         "Hồ sơ ứng tuyển hoàn tất chu trình tuyển dụng."),

        ("UC09", "Quản trị & Xét duyệt Nhà tuyển dụng", "Admin",
         "Kiểm duyệt tính pháp lý của doanh nghiệp đăng ký tham gia nền tảng.",
         "Admin đã đăng nhập. Có doanh nghiệp ở trạng thái PENDING.",
         "1. Admin truy cập trang Manage Recruiters, chọn tab 'Pending Approvals'.\n2. Bấm 'Details' để mở modal kiểm tra: Mã số thuế, địa chỉ, giấy phép kinh doanh.\n3. Nếu hợp lệ: Bấm 'Approve' -> Cập nhật registrationStatus = 'APPROVED'.\n4. Nếu không hợp lệ: Bấm 'Reject' -> Hệ thống hiển thị hộp thoại bắt buộc nhập lý do từ chối -> Lưu rejectionReason và cập nhật status = 'REJECTED'.\n5. Khi cần chế tài: Admin bấm 'Suspend' hoặc 'Reactivate' để đóng/mở quyền tài khoản.",
         "• 4a. Admin không nhập lý do từ chối: Hệ thống chặn lại và yêu cầu giải trình.",
         "Tài khoản Recruiter được phê duyệt để đăng tin hoặc bị từ chối/đình chỉ."),

        ("UC10", "Kiểm duyệt & Quản lý hiển thị việc làm", "Admin",
         "Giám sát và kiểm duyệt nội dung tin tuyển dụng toàn hệ thống.",
         "Admin đã đăng nhập; danh sách công việc được tải từ hệ thống.",
         "1. Admin truy cập trang Manage Jobs (/admin/jobs).\n2. Xem danh sách tin tuyển dụng kèm số lượng ứng viên nộp thực tế (applicationCount).\n3. Bấm 'Details' xem nội dung chi tiết công việc.\n4. Nếu phát hiện tin vi phạm: Bấm 'Hide' -> Cập nhật isVisible = false (tin lập tức biến mất khỏi trang tìm việc của ứng viên).\n5. Khi doanh nghiệp khắc phục: Bấm 'Restore' -> Cập nhật isVisible = true.",
         "• Thao tác có hiệu lực tức thì trên toàn hệ thống.",
         "Tin tuyển dụng được ẩn hoặc khôi phục hiển thị chính xác.")
    ]

    for uc_id, uc_name, actor, desc, pre, main_flow, alt_flow, post in use_cases_data:
        add_heading_3(doc, f"{uc_id}: {uc_name}")
        uc_tbl = doc.add_table(rows=8, cols=2)
        uc_rows = [
            ("Mã Use Case", uc_id),
            ("Tên Use Case", uc_name),
            ("Tác nhân chính (Actor)", actor),
            ("Mô tả tóm tắt", desc),
            ("Tiền điều kiện", pre),
            ("Luồng sự kiện chính (Main Flow)", main_flow),
            ("Luồng sự kiện phụ (Alternative Flow)", alt_flow),
            ("Hậu điều kiện", post)
        ]
        for r_i, (lbl, val) in enumerate(uc_rows):
            r = uc_tbl.rows[r_i]
            r.cells[0].paragraphs[0].text = lbl
            r.cells[1].paragraphs[0].text = val
        format_table(uc_tbl, col_widths=[2.0, 5.0])
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    add_heading_2(doc, "2.4 Yêu cầu phi chức năng (Non-Functional Requirements)")
    add_bullet(doc, "NFR-SEC (Bảo mật thông tin):", "Mật khẩu người dùng được băm một chiều bằng thuật toán bcrypt với salt rounds = 10. Phiên xác thực quản lý bằng JSON Web Token (JWT) lưu trữ trong HTTP-only Cookie để loại bỏ nguy cơ tấn công XSS. Tiêu đề HTTP được gia cố bằng Helmet với cấu hình Content Security Policy (CSP frame-src cho blob). Đường dẫn tải file CV được ký số tạm thời (Signed URL).")
    add_bullet(doc, "NFR-PERF (Hiệu năng và Tối ưu hóa):", "Cơ sở dữ liệu MongoDB được thiết lập các chỉ mục hợp phần (Compound Indexes) trên các trường truy vấn thường xuyên như `{ jobId: 1, status: 1 }` và `{ candidateId: 1, createdAt: -1 }`. Hạn chế nộp đơn trùng lặp bằng Unique Compound Index `{ candidateId: 1, jobId: 1 }`. Hệ thống sử dụng phân trang (Pagination) ở cả Backend và Frontend để tối ưu thời gian phản hồi dưới 200ms đối với các tập dữ liệu lớn.")
    add_bullet(doc, "NFR-RELIAB (Độ tin cậy và Tính toàn vẹn):", "Dữ liệu được ràng buộc chặt chẽ từ tầng Mongoose Schema kết hợp express-validator. Tiến trình cron định kỳ tự động đóng tin tuyển dụng quá hạn giúp dữ liệu luôn phản ánh trạng thái thực tế mà không cần thao tác thủ công.")
    add_bullet(doc, "NFR-USAB (Tính khả dụng và Trải nghiệm người dùng):", "Giao diện tuân thủ chuẩn Responsive Design thích ứng hoàn hảo trên Desktop, Tablet và Mobile. Thiết kế đồng bộ theo hệ màu Deep Teal (#0F766E), hỗ trợ bộ lọc nhanh TopCV, thông báo tương tác tức thời qua React Hot Toast và modal xác nhận cho mọi thao tác quan trọng.")

    doc.add_page_break()

    print("Generating Chapter 3: System Design...")
    # ==========================================================
    # CHAPTER 3: THIẾT KẾ HỆ THỐNG
    # ==========================================================
    add_heading_1(doc, "CHƯƠNG 3. THIẾT KẾ HỆ THỐNG")

    add_heading_2(doc, "3.1 Kiến trúc tổng thể hệ thống (System Architecture)")
    add_p(doc, "Hệ thống TalentPulse được thiết kế theo mô hình kiến trúc phân rã 3 tầng (3-Tier Decoupled Architecture), tách biệt hoàn toàn giữa tầng Trình diễn (Presentation Tier), tầng Ứng dụng & Nghiệp vụ (Application Tier), và tầng Dữ liệu & Lưu trữ (Data & Storage Tier). Mô hình này đảm bảo tính độc lập, dễ dàng nâng cấp, mở rộng và bảo trì.")
    add_image_with_caption(doc, "system_architecture_diagram.png", "Hình 3.1: Sơ đồ Kiến trúc Tổng thể Hệ thống TalentPulse (3-Tier Architecture)")
    add_p(doc, "Chi tiết các tầng kiến trúc:")
    add_bullet(doc, "Presentation Tier (Frontend Client):", "Ứng dụng Single Page Application (SPA) phát triển bằng React 18 và Vite. Giao diện người dùng được chia thành 3 không gian làm việc độc lập tương ứng với 3 Layout: CandidateLayout, RecruiterLayout và AdminLayout.")
    add_bullet(doc, "Application Tier (Backend REST API):", "Máy chủ Node.js & Express đóng vai trò API Gateway và xử lý toàn bộ logic nghiệp vụ. Tầng này tiếp nhận các yêu cầu HTTP/HTTPS, kiểm tra tính hợp lệ dữ liệu, thực thi phân quyền và điều phối luồng dữ liệu.")
    add_bullet(doc, "Data & Storage Tier:", "Bao gồm MongoDB lưu trữ toàn bộ dữ liệu có cấu trúc và Cloudinary Cloud Storage lưu trữ các tệp nhị phân kích thước lớn (CV ứng viên, giấy phép kinh doanh).")

    add_heading_2(doc, "3.2 Thiết kế kiến trúc Backend (Backend Layered Architecture)")
    add_p(doc, "Phía máy chủ Backend được tổ chức nghiêm ngặt theo mô hình phân tầng hướng dịch vụ (Layered Service-Oriented Pattern), bao gồm các lớp thành phần sau:")
    add_bullet(doc, "Routes Layer:", "Định nghĩa danh mục các API endpoints, ánh xạ URL với controller và gán các middleware bảo vệ (auth.protect, auth.authorize, express-validator).")
    add_bullet(doc, "Middlewares Layer:", "Thực hiện các tác vụ tiền xử lý: Xác thực JWT từ cookie, kiểm tra quyền truy cập theo vai trò, bắt lỗi xác thực dữ liệu đầu vào (validateRequest), xử lý file tải lên (Multer) và bắt lỗi toàn cục (errorHandler).")
    add_bullet(doc, "Controllers Layer:", "Tiếp nhận request từ client, trích xuất tham số (params, query, body), gọi các hàm xử lý tương ứng từ Service layer và định dạng phản hồi chuẩn JSON.")
    add_bullet(doc, "Services Layer:", "Nơi chứa toàn bộ logic nghiệp vụ cốt lõi của ứng dụng (Business Logic). Các dịch vụ (AuthService, JobService, ApplicationService, InterviewService, AdminService) thực hiện tính toán, kiểm tra ràng buộc trạng thái và tương tác với cơ sở dữ liệu.")
    add_bullet(doc, "Models Layer:", "Định nghĩa cấu trúc lược đồ Mongoose Schemas, các validation rules cấp cơ sở dữ liệu, các hàm pre-hooks và thiết lập indexes tối ưu truy vấn.")
    add_bullet(doc, "Schedulers Layer:", "Tiến trình chạy nền độc lập quản lý bởi node-cron (startJobScheduler) thực hiện tự động cập nhật trạng thái các công việc đã hết hạn nộp hồ sơ.")

    add_p(doc, "Ví dụ thực tế về luồng xử lý một Request điển hình (POST /api/jobs/:id/publish):")
    add_code_block(doc, 
"""Client Request: PATCH /api/jobs/65b123.../publish (Kèm HTTP-only Cookie)
  │
  ├── 1. authMiddleware.protect: Trích xuất cookie 'token', verify JWT -> Query DB User.findById()
  │      -> Kiểm tra user.isActive === true (Nếu false -> throw AppError 401)
  │      -> Gán req.user = { id, role }
  │
  ├── 2. authMiddleware.authorize(ROLE.RECRUITER): Kiểm tra req.user.role === 'RECRUITER' (Nếu sai -> 403)
  │
  ├── 3. jobController.publishJob(req, res, next): Gọi jobService.publishJob(recruiterId, jobId)
  │
  ├── 4. jobService.publishJob:
  │      -> checkApprovedRecruiter: Kiểm tra Recruiter đã APPROVED và đang ACTIVE
  │      -> Tìm Job theo ID và recruiterId (Ràng buộc quyền sở hữu)
  │      -> Kiểm tra trạng thái hiện tại: Chỉ cho phép chuyển từ DRAFT sang OPENING
  │      -> Cập nhật job.status = JOB_STATUS.OPENING, lưu DB
  │
  └── 5. Controller trả về: HTTP 200 OK { success: true, message: 'Job published', data: { job } }""")

    add_heading_2(doc, "3.3 Thiết kế kiến trúc Frontend (Frontend Architecture)")
    add_p(doc, "Frontend được thiết kế theo hướng module hóa cao, đảm bảo tái sử dụng tối đa mã nguồn và phân tách rõ ràng trải nghiệm giữa các nhóm người dùng:")
    add_bullet(doc, "Cấu trúc thư mục phân tách theo chức năng:", "src/pages/ chia thành auth/, candidate/, recruiter/, admin/; src/components/ chứa các component giao diện dùng chung; src/services/ tập trung toàn bộ các hàm gọi API.")
    add_bullet(doc, "Kiến trúc Layouts & Protected Routes:", "Sử dụng component ProtectedRoute bọc quanh các tuyến đường nhạy cảm. Nếu người dùng chưa đăng nhập hoặc không có vai trò hợp lệ, hệ thống tự động điều hướng về /login hoặc trang mặc định.")
    add_bullet(doc, "Quản lý trạng thái phiên làm việc (AuthContext):", "Cung cấp hook useAuth() giúp toàn bộ cây component truy cập tức thời thông tin người dùng hiện tại, trạng thái phê duyệt và hàm đăng xuất.")
    add_bullet(doc, "Xử lý dữ liệu nhị phân (Blob Handling):", "Khi xem trước hoặc tải CV, Axios nhận responseType = 'blob'. Frontend tạo Object URL bằng URL.createObjectURL(blob) và giải phóng bộ nhớ bằng URL.revokeObjectURL() khi đóng modal nhằm triệt tiêu rò rỉ bộ nhớ (memory leaks).")

    add_heading_2(doc, "3.4 Thiết kế Xác thực và Phân quyền (Authentication & Authorization Design)")
    add_p(doc, "Cơ chế bảo mật của TalentPulse kết hợp giữa mã hóa mật khẩu một chiều, chữ ký số JSON Web Token và phân quyền RBAC đa cấp độ:")
    add_image_with_caption(doc, "auth_flow_diagram.png", "Hình 3.2: Sơ đồ luồng Xác thực JWT qua Cookie và Phân quyền RBAC")
    add_bullet(doc, "Lưu trữ Token an toàn tuyệt đối:", "Token không lưu trữ trong localStorage hay sessionStorage (vốn dễ bị đánh cắp qua tấn công XSS). Token được gửi qua HTTP-only, SameSite Cookie từ phía server, trình duyệt tự động đính kèm trong mọi request tiếp theo.")
    add_bullet(doc, "Kiểm tra tính hợp lệ kép (Double-check Status):", "Tại mỗi request được bảo vệ, ngoài việc kiểm tra chữ ký số JWT, hệ thống đều truy vấn lại cơ sở dữ liệu để đảm bảo tài khoản không bị Admin đình chỉ (`isActive === true`). Nếu tài khoản vừa bị khóa, mọi phiên làm việc lập tức bị vô hiệu hóa.")

    doc.add_page_break()

    print("Generating Chapter 4: Database Design...")
    # ==========================================================
    # CHAPTER 4: THIẾT KẾ CƠ SỞ DỮ LIỆU
    # ==========================================================
    add_heading_1(doc, "CHƯƠNG 4. THIẾT KẾ CƠ SỞ DỮ LIỆU")

    add_heading_2(doc, "4.1 Tổng quan cơ sở dữ liệu MongoDB")
    add_p(doc, "TalentPulse sử dụng hệ quản trị cơ sở dữ liệu tài liệu MongoDB kết hợp Mongoose ODM. Mô hình dữ liệu được thiết kế cân bằng giữa tính linh hoạt của NoSQL và tính chặt chẽ của quan hệ tham chiếu (Referencing Pattern), giúp tối ưu hóa tốc độ đọc ghi đồng thời duy trì tính toàn vẹn dữ liệu.")

    add_heading_2(doc, "4.2 Đặc tả chi tiết các Mongoose Models & Collections")
    add_p(doc, "Dưới đây là cấu trúc chi tiết của 6 thực thể Mongoose được hiện thực trong dự án:")

    # 1. User
    add_heading_3(doc, "4.2.1 Bảng Users (Collection: users)")
    user_fields = [
        ("_id", "ObjectId", "Có", "Tự sinh", "Khóa chính (Primary Key) định danh người dùng"),
        ("role", "String", "Có", "—", "Vai trò: CANDIDATE, RECRUITER, ADMIN"),
        ("email", "String", "Có", "—", "Email đăng nhập, định dạng chuẩn, duy nhất (Unique Index)"),
        ("passwordHash", "String", "Có", "—", "Mật khẩu đã được băm an toàn bằng bcrypt"),
        ("fullName", "String", "Điều kiện", "null", "Họ tên ứng viên (Bắt buộc nếu role = CANDIDATE/ADMIN)"),
        ("companyName", "String", "Điều kiện", "null", "Tên doanh nghiệp (Bắt buộc nếu role = RECRUITER)"),
        ("phone", "String", "Không", "null", "Số điện thoại liên hệ"),
        ("address", "String", "Không", "null", "Địa chỉ liên lạc hoặc trụ sở công ty"),
        ("website", "String", "Không", "null", "Website chính thức của doanh nghiệp (Recruiter)"),
        ("businessRegistrationNumber", "String", "Điều kiện", "null", "Mã số thuế / Giấy phép kinh doanh (Bắt buộc Recruiter)"),
        ("businessLicenseUrl", "String", "Điều kiện", "null", "URL tài liệu giấy phép kinh doanh (Bắt buộc Recruiter)"),
        ("registrationStatus", "String", "Không", "null", "Trạng thái duyệt Recruiter: PENDING, APPROVED, REJECTED"),
        ("isActive", "Boolean", "Không", "true", "Trạng thái hoạt động tài khoản (false = bị đình chỉ)"),
        ("rejectionReason", "String", "Không", "null", "Lý do từ chối đăng ký doanh nghiệp từ Admin"),
        ("reviewedBy", "ObjectId", "Không", "null", "Tham chiếu đến User (Admin) thực hiện xét duyệt"),
        ("reviewedAt", "Date", "Không", "null", "Thời điểm xét duyệt đăng ký"),
        ("createdAt / updatedAt", "Date", "Tự động", "now()", "Dấu thời gian tạo và cập nhật bản ghi")
    ]
    u_tbl = doc.add_table(rows=1, cols=5)
    u_tbl.rows[0].cells[0].paragraphs[0].text = "Tên trường (Field)"
    u_tbl.rows[0].cells[1].paragraphs[0].text = "Kiểu dữ liệu"
    u_tbl.rows[0].cells[2].paragraphs[0].text = "Bắt buộc"
    u_tbl.rows[0].cells[3].paragraphs[0].text = "Mặc định"
    u_tbl.rows[0].cells[4].paragraphs[0].text = "Diễn giải ý nghĩa"
    for row in user_fields:
        r = u_tbl.add_row()
        for idx, text in enumerate(row):
            r.cells[idx].paragraphs[0].text = text
    format_table(u_tbl, col_widths=[1.5, 1.0, 0.8, 0.9, 2.8])

    # 2. Job
    add_heading_3(doc, "4.2.2 Bảng Jobs (Collection: jobs)")
    job_fields = [
        ("_id", "ObjectId", "Có", "Tự sinh", "Khóa chính định danh tin tuyển dụng"),
        ("recruiterId", "ObjectId", "Có", "—", "Khóa ngoại tham chiếu đến User (Recruiter) đăng tin"),
        ("title", "String", "Có", "—", "Tiêu đề vị trí tuyển dụng (Tối đa 150 ký tự)"),
        ("description", "String", "Có", "—", "Mô tả chi tiết công việc và yêu cầu tuyển dụng"),
        ("category", "String", "Có", "—", "Ngành nghề: IT_SOFTWARE, BUSINESS, MARKETING, v.v."),
        ("employmentType", "String", "Có", "—", "Hình thức: FULL_TIME, PART_TIME, INTERNSHIP, v.v."),
        ("experienceLevel", "String", "Có", "—", "Cấp bậc: FRESHER, JUNIOR, MIDDLE, SENIOR, v.v."),
        ("workLocationType", "String", "Có", "—", "Địa điểm làm việc: ONSITE, REMOTE, HYBRID"),
        ("location", "String", "Không", "null", "Địa chỉ làm việc thực tế (Thành phố / Quận huyện)"),
        ("salaryMin / salaryMax", "Number", "Không", "null", "Khoảng lương tối thiểu và tối đa (VNĐ hoặc USD)"),
        ("salaryCurrency", "String", "Không", "VND", "Đơn vị tiền tệ: VND, USD"),
        ("salaryPeriod", "String", "Không", "MONTH", "Kỳ hạn lương: MONTH, HOUR, YEAR"),
        ("numberOfPositions", "Number", "Có", "1", "Số lượng nhân sự cần tuyển (Tối thiểu 1)"),
        ("applicationStartDate", "Date", "Có", "—", "Ngày bắt đầu nhận hồ sơ"),
        ("applicationEndDate", "Date", "Có", "—", "Hạn chót nộp hồ sơ (Phải lớn hơn ngày bắt đầu)"),
        ("status", "String", "Có", "DRAFT", "Trạng thái tin: DRAFT, OPENING, CLOSED"),
        ("isVisible", "Boolean", "Không", "true", "Quyền hiển thị trên sàn (Admin có thể ẩn/hiện)"),
        ("isDeleted", "Boolean", "Không", "false", "Cờ đánh dấu xóa mềm (Soft delete)")
    ]
    j_tbl = doc.add_table(rows=1, cols=5)
    j_tbl.rows[0].cells[0].paragraphs[0].text = "Tên trường (Field)"
    j_tbl.rows[0].cells[1].paragraphs[0].text = "Kiểu dữ liệu"
    j_tbl.rows[0].cells[2].paragraphs[0].text = "Bắt buộc"
    j_tbl.rows[0].cells[3].paragraphs[0].text = "Mặc định"
    j_tbl.rows[0].cells[4].paragraphs[0].text = "Diễn giải ý nghĩa"
    for row in job_fields:
        r = j_tbl.add_row()
        for idx, text in enumerate(row):
            r.cells[idx].paragraphs[0].text = text
    format_table(j_tbl, col_widths=[1.5, 1.0, 0.8, 0.9, 2.8])

    # 3. Application
    add_heading_3(doc, "4.2.3 Bảng Applications (Collection: applications)")
    app_fields = [
        ("_id", "ObjectId", "Có", "Tự sinh", "Khóa chính định danh đơn ứng tuyển"),
        ("candidateId", "ObjectId", "Có", "—", "Khóa ngoại tham chiếu đến User (Candidate) nộp đơn"),
        ("jobId", "ObjectId", "Có", "—", "Khóa ngoại tham chiếu đến Job ứng tuyển"),
        ("applicantName", "String", "Có", "—", "Họ tên ứng viên tại thời điểm nộp đơn"),
        ("applicantEmail", "String", "Có", "—", "Email liên hệ ứng viên"),
        ("applicantPhone", "String", "Không", "null", "Số điện thoại ứng viên"),
        ("cv.url", "String", "Có", "—", "URL Cloudinary tải file CV"),
        ("cv.publicId", "String", "Có", "—", "Public ID quản lý file trên Cloudinary"),
        ("cv.fileName", "String", "Có", "—", "Tên file gốc do ứng viên tải lên (kèm đuôi file)"),
        ("status", "String", "Có", "APPLIED", "Trạng thái tuyển dụng (7 trạng thái chuẩn hóa)"),
        ("statusUpdatedAt", "Date", "Không", "now()", "Thời điểm chuyển đổi trạng thái gần nhất")
    ]
    a_tbl = doc.add_table(rows=1, cols=5)
    a_tbl.rows[0].cells[0].paragraphs[0].text = "Tên trường (Field)"
    a_tbl.rows[0].cells[1].paragraphs[0].text = "Kiểu dữ liệu"
    a_tbl.rows[0].cells[2].paragraphs[0].text = "Bắt buộc"
    a_tbl.rows[0].cells[3].paragraphs[0].text = "Mặc định"
    a_tbl.rows[0].cells[4].paragraphs[0].text = "Diễn giải ý nghĩa"
    for row in app_fields:
        r = a_tbl.add_row()
        for idx, text in enumerate(row):
            r.cells[idx].paragraphs[0].text = text
    format_table(a_tbl, col_widths=[1.5, 1.0, 0.8, 0.9, 2.8])

    # 4. Interview
    add_heading_3(doc, "4.2.4 Bảng Interviews (Collection: interviews)")
    iv_fields = [
        ("_id", "ObjectId", "Có", "Tự sinh", "Khóa chính định danh lịch phỏng vấn"),
        ("applicationId", "ObjectId", "Có", "—", "Khóa ngoại tham chiếu duy nhất đến Application (1:1)"),
        ("startTime", "Date", "Có", "—", "Thời gian bắt đầu phỏng vấn"),
        ("endTime", "Date", "Có", "—", "Thời gian kết thúc phỏng vấn (Phải > startTime)"),
        ("interviewType", "String", "Có", "—", "Hình thức phỏng vấn: ONLINE hoặc ONSITE"),
        ("meetingUrl", "String", "Điều kiện", "null", "Link họp video (Bắt buộc nếu interviewType = ONLINE)"),
        ("officeAddress", "String", "Điều kiện", "null", "Địa chỉ phỏng vấn (Bắt buộc nếu interviewType = ONSITE)"),
        ("notes", "String", "Không", "null", "Ghi chú, nhận xét và đánh giá của Recruiter")
    ]
    iv_tbl = doc.add_table(rows=1, cols=5)
    iv_tbl.rows[0].cells[0].paragraphs[0].text = "Tên trường (Field)"
    iv_tbl.rows[0].cells[1].paragraphs[0].text = "Kiểu dữ liệu"
    iv_tbl.rows[0].cells[2].paragraphs[0].text = "Bắt buộc"
    iv_tbl.rows[0].cells[3].paragraphs[0].text = "Mặc định"
    iv_tbl.rows[0].cells[4].paragraphs[0].text = "Diễn giải ý nghĩa"
    for row in iv_fields:
        r = iv_tbl.add_row()
        for idx, text in enumerate(row):
            r.cells[idx].paragraphs[0].text = text
    format_table(iv_tbl, col_widths=[1.5, 1.0, 0.8, 0.9, 2.8])

    # 5. PasswordResetToken & 6. EmailLog
    add_heading_3(doc, "4.2.5 Các bảng hỗ trợ (PasswordResetToken & EmailLog)")
    add_p(doc, "• PasswordResetTokens: Lưu trữ mã token đặt lại mật khẩu đã băm (tokenHash), liên kết với userId (1:1), có trường expiresAt gắn chỉ mục TTL Index (tự động xóa bản ghi khi hết hạn) và usedAt đánh dấu thời điểm sử dụng.")
    add_p(doc, "• EmailLogs: Lưu trữ lịch sử các email hệ thống tạo ra, liên kết senderId (User), applicationId (Application), emailType (INVITATION, RESULT), recipientEmail, subject, body, status (SENT, FAILED) và sentAt.")

    add_heading_2(doc, "4.3 Sơ đồ quan hệ thực thể (Entity Relationship Diagram - ERD)")
    add_p(doc, "Hình 4.1 thể hiện cấu trúc quan hệ giữa các thực thể dữ liệu trong TalentPulse:")
    add_image_with_caption(doc, "erd_diagram.png", "Hình 4.1: Sơ đồ Thực thể Liên kết (Entity Relationship Diagram - ERD)")
    add_p(doc, "Phân tích mối quan hệ giữa các thực thể:")
    add_bullet(doc, "User (Recruiter) 1 ── N Job:", "Một nhà tuyển dụng có thể tạo và quản lý nhiều tin tuyển dụng (`Job.recruiterId`).")
    add_bullet(doc, "User (Candidate) 1 ── N Application:", "Một ứng viên có thể nộp đơn vào nhiều vị trí công việc khác nhau (`Application.candidateId`).")
    add_bullet(doc, "Job 1 ── N Application:", "Một tin tuyển dụng tiếp nhận nhiều hồ sơ ứng tuyển từ các ứng viên khác nhau (`Application.jobId`).")
    add_bullet(doc, "Application 1 ── 1 Interview:", "Mỗi đơn ứng tuyển chỉ có tối đa một lịch phỏng vấn và bản đánh giá duy nhất (`Interview.applicationId` với ràng buộc Unique Index).")
    add_bullet(doc, "User 1 ── 0..1 PasswordResetToken:", "Mỗi người dùng tại một thời điểm chỉ tồn tại tối đa một token đặt lại mật khẩu chưa sử dụng.")

    add_heading_2(doc, "4.4 Định nghĩa các trạng thái và chuyển đổi vòng đời")
    add_p(doc, "Hệ thống quản lý chặt chẽ vòng đời của các thực thể qua các máy trạng thái hữu hạn (Finite State Machines):")

    add_heading_3(doc, "4.4.1 Vòng đời Đơn ứng tuyển (Application Lifecycle)")
    app_status_data = [
        ("APPLIED", "Ứng viên vừa nộp đơn thành công. Hồ sơ đang nằm ở tab Pending chờ Recruiter xem xét CV.", "PASSED_CV (Duyệt CV) hoặc REJECTED_CV (Từ chối CV)"),
        ("PASSED_CV", "CV của ứng viên đã được duyệt. Ứng viên nằm ở tab Passed CV, sẵn sàng được lên lịch phỏng vấn.", "WAITING_INTERVIEW (Khi được lên lịch hẹn phỏng vấn)"),
        ("REJECTED_CV", "CV không đạt yêu cầu ở vòng lọc hồ sơ. Hồ sơ được lưu trữ và có thể tra cứu tại tab All.", "Trạng thái kết thúc (Terminal State)"),
        ("WAITING_INTERVIEW", "Ứng viên đã có lịch hẹn phỏng vấn cụ thể. Nằm ở tab Waiting Interview chờ phỏng vấn.", "INTERVIEWED (Khi Recruiter lưu nhận xét đánh giá phỏng vấn)"),
        ("INTERVIEWED", "Ứng viên đã hoàn thành phỏng vấn và có điểm đánh giá. Nằm ở tab Waiting Result chờ quyết định.", "PASSED (Chấp nhận tuyển dụng) hoặc REJECTED_INTERVIEW (Loại)"),
        ("PASSED", "Ứng viên được chấp nhận tuyển dụng (Offer). Nằm ở tab Passed (Hồ sơ trúng tuyển).", "Trạng thái thành công cuối cùng (Successful State)"),
        ("REJECTED_INTERVIEW", "Ứng viên không đạt yêu cầu sau vòng phỏng vấn. Hồ sơ được lưu trữ tại tab All.", "Trạng thái kết thúc (Terminal State)")
    ]
    as_tbl = doc.add_table(rows=1, cols=3)
    as_tbl.rows[0].cells[0].paragraphs[0].text = "Trạng thái (Status)"
    as_tbl.rows[0].cells[1].paragraphs[0].text = "Ý nghĩa nghiệp vụ"
    as_tbl.rows[0].cells[2].paragraphs[0].text = "Trạng thái tiếp theo cho phép"
    for row in app_status_data:
        r = as_tbl.add_row()
        for idx, text in enumerate(row):
            r.cells[idx].paragraphs[0].text = text
    format_table(as_tbl, col_widths=[1.8, 3.2, 2.0])

    add_heading_3(doc, "4.4.2 Vòng đời Tin tuyển dụng (Job Lifecycle)")
    add_bullet(doc, "DRAFT:", "Tin tuyển dụng lưu nháp, chưa công khai, có thể chỉnh sửa mọi thông tin hoặc xóa hoàn toàn.")
    add_bullet(doc, "OPENING:", "Tin tuyển dụng đang mở công khai, hiển thị trên bảng tin việc làm cho ứng viên nộp hồ sơ.")
    add_bullet(doc, "CLOSED:", "Tin tuyển dụng đã đóng (do Recruiter chủ động đóng hoặc do Cron Scheduler tự động đóng khi `applicationEndDate < new Date()`). Ứng viên không thể nộp đơn thêm.")

    doc.add_page_break()

    print("Generating Chapter 5: API Design & Implementation...")
    # ==========================================================
    # CHAPTER 5: THIẾT KẾ VÀ HIỆN THỰC API
    # ==========================================================
    add_heading_1(doc, "CHƯƠNG 5. THIẾT KẾ VÀ HIỆN THỰC RESTFUL API")

    add_heading_2(doc, "5.1 Tổng quan RESTful API và Quy ước thiết kế")
    add_p(doc, "Hệ thống RESTful API của TalentPulse được thiết kế theo tiêu chuẩn RESTful API Architecture, sử dụng định dạng JSON cho việc trao đổi dữ liệu. Tất cả các endpoint đều có tiền tố chung là `/api` và sử dụng danh từ số nhiều để định danh tài nguyên (resources).")
    add_bullet(doc, "Phương thức HTTP chuẩn:", "GET (truy xuất tài nguyên), POST (tạo tài nguyên mới), PATCH (cập nhật từng phần), DELETE (xóa tài nguyên).")
    add_bullet(doc, "Quy ước mã phản hồi HTTP:", "200 OK (thành công), 201 Created (tạo mới thành công), 400 Bad Request (lỗi validation dữ liệu), 401 Unauthorized (chưa xác thực hoặc token hết hạn), 403 Forbidden (sai quyền truy cập role), 404 Not Found (không tìm thấy tài nguyên), 500 Internal Server Error (lỗi phía máy chủ).")

    add_heading_2(doc, "5.2 Bảng đặc tả chi tiết toàn bộ Endpoint hệ thống")
    add_p(doc, "Bảng sau tổng hợp toàn bộ 37 API Endpoints được hiện thực trong Backend của TalentPulse:")

    api_endpoints = [
        # Auth
        ("POST", "/api/auth/register/candidate", "Public", "Đăng ký tài khoản Ứng viên"),
        ("POST", "/api/auth/register/recruiter", "Public", "Đăng ký tài khoản Doanh nghiệp"),
        ("POST", "/api/auth/login", "Public", "Đăng nhập và cấp phát HTTP-only JWT Cookie"),
        ("POST", "/api/auth/logout", "Authenticated", "Đăng xuất và hủy Cookie phiên làm việc"),
        ("POST", "/api/auth/forgot-password", "Public", "Yêu cầu mã đặt lại mật khẩu qua email"),
        ("POST", "/api/auth/reset-password", "Public", "Xác nhận token và cập nhật mật khẩu mới"),
        # Jobs
        ("GET", "/api/jobs", "Public / Candidate", "Lấy danh sách việc làm mở (Hỗ trợ lọc TopCV đa tiêu chí)"),
        ("GET", "/api/jobs/:jobId", "Public / Candidate", "Lấy chi tiết việc làm theo ID"),
        ("GET", "/api/jobs/my-jobs", "Recruiter", "Lấy danh sách việc làm do Recruiter hiện tại tạo"),
        ("GET", "/api/jobs/my-jobs/:id", "Recruiter", "Xem chi tiết việc làm của Recruiter"),
        ("POST", "/api/jobs", "Recruiter", "Tạo tin tuyển dụng mới (Trạng thái DRAFT hoặc OPENING)"),
        ("PATCH", "/api/jobs/:id", "Recruiter", "Chỉnh sửa tin tuyển dụng ở trạng thái DRAFT"),
        ("PATCH", "/api/jobs/:id/publish", "Recruiter", "Xuất bản tin nháp DRAFT thành OPENING"),
        ("PATCH", "/api/jobs/:id/close", "Recruiter", "Đóng tin tuyển dụng đang mở thành CLOSED"),
        ("DELETE", "/api/jobs/:id", "Recruiter", "Xóa tin tuyển dụng (Soft delete isDeleted = true)"),
        # Applications
        ("POST", "/api/applications/:jobId", "Candidate", "Nộp đơn ứng tuyển kèm tải file CV lên Cloudinary"),
        ("GET", "/api/applications/my-applications", "Candidate", "Xem danh sách hồ sơ ứng tuyển của bản thân"),
        ("GET", "/api/applications/:applicationId", "Candidate, Recruiter", "Xem chi tiết hồ sơ đơn ứng tuyển"),
        ("GET", "/api/applications/job/:jobId", "Recruiter", "Xem danh sách ứng viên theo Job (Phân loại theo 6 tab)"),
        ("PATCH", "/api/applications/:applicationId/status", "Recruiter", "Cập nhật trạng thái hồ sơ (Accept/Reject CV, Offer, Reject)"),
        ("GET", "/api/applications/:applicationId/cv", "Candidate, Recruiter, Admin", "Tải stream dữ liệu file CV gốc hoặc lấy URL xem trước"),
        # Interviews
        ("GET", "/api/interviews", "Recruiter", "Lấy danh sách các buổi phỏng vấn đã lên lịch"),
        ("GET", "/api/interviews/passed-candidates", "Recruiter", "Lấy danh sách ứng viên đã trúng tuyển"),
        ("POST", "/api/interviews/bulk-schedule", "Recruiter", "Lên lịch phỏng vấn đồng loạt cho nhiều ứng viên"),
        ("GET", "/api/interviews/applications/:applicationId", "Recruiter", "Lấy thông tin phỏng vấn phục vụ trang Evaluation"),
        ("POST", "/api/interviews/applications/:applicationId/evaluate", "Recruiter", "Lưu ghi chú đánh giá và chuyển trạng thái sang INTERVIEWED"),
        ("GET", "/api/interviews/:id", "Recruiter", "Xem chi tiết một buổi phỏng vấn"),
        ("PATCH", "/api/interviews/:id/notes", "Recruiter", "Cập nhật ghi chú đánh giá của buổi phỏng vấn"),
        ("POST", "/api/interviews/applications/:applicationId/schedule", "Recruiter", "Lên lịch phỏng vấn cho một ứng viên đơn lẻ"),
        # Admin
        ("GET", "/api/admin/recruiters/pending", "Admin", "Lấy danh sách Recruiter đang chờ phê duyệt"),
        ("GET", "/api/admin/recruiters", "Admin", "Lấy danh sách Recruiter theo tab (All, Pending, Active, Suspended)"),
        ("GET", "/api/admin/recruiters/:id", "Admin", "Xem chi tiết hồ sơ Recruiter kèm danh sách việc làm"),
        ("PATCH", "/api/admin/recruiters/:id/review", "Admin", "Phê duyệt (APPROVED) hoặc Từ chối (REJECTED) Recruiter"),
        ("PATCH", "/api/admin/recruiters/:id/suspend", "Admin", "Đình chỉ hoạt động tài khoản Recruiter"),
        ("PATCH", "/api/admin/recruiters/:id/reactivate", "Admin", "Kích hoạt lại tài khoản Recruiter"),
        ("GET", "/api/admin/jobs", "Admin", "Lấy danh sách toàn bộ việc làm kèm số lượng ứng viên"),
        ("PATCH", "/api/admin/jobs/:id/hide", "Admin", "Ẩn tin tuyển dụng khỏi bảng tin công khai"),
        ("PATCH", "/api/admin/jobs/:id/restore", "Admin", "Khôi phục hiển thị tin tuyển dụng"),
        # User
        ("GET", "/api/my-profile", "Authenticated", "Lấy thông tin profile người dùng hiện tại"),
        ("PATCH", "/api/my-profile", "Candidate", "Cập nhật thông tin profile ứng viên"),
        ("PATCH", "/api/change-password", "Authenticated", "Đổi mật khẩu người dùng")
    ]

    ep_tbl = doc.add_table(rows=1, cols=4)
    ep_tbl.rows[0].cells[0].paragraphs[0].text = "Phương thức"
    ep_tbl.rows[0].cells[1].paragraphs[0].text = "Đường dẫn (Endpoint URI)"
    ep_tbl.rows[0].cells[2].paragraphs[0].text = "Quyền (Role)"
    ep_tbl.rows[0].cells[3].paragraphs[0].text = "Mô tả chức năng"
    for row in api_endpoints:
        r = ep_tbl.add_row()
        for idx, text in enumerate(row):
            r.cells[idx].paragraphs[0].text = text
    format_table(ep_tbl, col_widths=[1.1, 2.5, 1.4, 2.0])

    add_heading_2(doc, "5.3 Ví dụ Request và Response JSON tiêu biểu")
    add_p(doc, "Dưới đây là các cấu trúc Request / Response JSON thực tế từ mã nguồn hệ thống:")

    add_heading_3(doc, "5.3.1 Đăng nhập hệ thống (POST /api/auth/login)")
    add_code_block(doc,
"""// Request Body:
{
  "email": "recruiter@fpt.edu.vn",
  "password": "Password@123"
}

// Successful Response (HTTP 200 OK):
// Set-Cookie: token=eyJhbGciOiJIUzI1Ni...; Path=/; HttpOnly; SameSite=Lax
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "67301f8e12a3b4c5d6e7f890",
      "email": "recruiter@fpt.edu.vn",
      "role": "RECRUITER",
      "companyName": "FPT Software Corporation",
      "registrationStatus": "APPROVED",
      "isActive": true
    }
  }
}""")

    add_heading_3(doc, "5.3.2 Nộp đơn ứng tuyển kèm CV (POST /api/applications/:jobId)")
    add_code_block(doc,
"""// Request: Content-Type: multipart/form-data
// Form fields: applicantName="Nguyễn Văn A", applicantPhone="0912345678", cv=[Binary PDF File]

// Successful Response (HTTP 201 Created):
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "application": {
      "_id": "673024ab12a3b4c5d6e7f891",
      "candidateId": "672f9a1212a3b4c5d6e7f888",
      "jobId": "672f9c3412a3b4c5d6e7f889",
      "applicantName": "Nguyễn Văn A",
      "applicantEmail": "candidate@gmail.com",
      "applicantPhone": "0912345678",
      "cv": {
        "url": "https://res.cloudinary.com/talentpulse/raw/upload/v1/cv/cv_abc123.pdf",
        "publicId": "candidate-management/applications/cv/cv_abc123.pdf",
        "fileName": "NguyenVanA_Frontend_Resume.pdf"
      },
      "status": "APPLIED",
      "createdAt": "2026-11-09T10:15:30.000Z"
    }
  }
}""")

    add_heading_3(doc, "5.3.3 Lưu đánh giá phỏng vấn (POST /api/interviews/applications/:id/evaluate)")
    add_code_block(doc,
"""// Request Body:
{
  "notes": "Ứng viên nắm vững kiến thức React, component lifecycle, và tư duy kiến trúc tốt. Đạt yêu cầu kỹ thuật vòng phỏng vấn."
}

// Successful Response (HTTP 200 OK):
{
  "success": true,
  "message": "Interview evaluation saved successfully",
  "data": {
    "applicationId": "673024ab12a3b4c5d6e7f891",
    "status": "INTERVIEWED",
    "statusUpdatedAt": "2026-11-09T15:30:00.000Z",
    "interview": {
      "_id": "673026cd12a3b4c5d6e7f892",
      "interviewType": "ONLINE",
      "meetingUrl": "https://meet.google.com/abc-defg-hij",
      "notes": "Ứng viên nắm vững kiến thức React, component lifecycle, và tư duy kiến trúc tốt. Đạt yêu cầu kỹ thuật vòng phỏng vấn."
    }
  }
}""")

    add_heading_2(doc, "5.4 Cơ chế Kiểm tra dữ liệu (Validation) và Xử lý lỗi tập trung")
    add_p(doc, "Hệ thống áp dụng kiến trúc bắt lỗi và xác thực dữ liệu hai lớp vững chắc:")
    add_bullet(doc, "Lớp Kiểm tra dữ liệu đầu vào (express-validator):", "Mọi request body, params và query đều được thẩm định qua validator middleware trước khi chuyển vào controller. Khi phát hiện dữ liệu sai định dạng (ví dụ lương âm, ngày hết hạn trước ngày bắt đầu, thiếu link meeting cho phỏng vấn online), middleware validateRequest lập tức chặn lại và trả về mã lỗi 400 cùng danh sách chi tiết các trường vi phạm.")
    add_bullet(doc, "Lớp Xử lý lỗi toàn cục (Global Error Middleware):", "Mọi lỗi phát sinh trong quá trình thực thi bất đồng bộ đều được chuyển tiếp qua hàm next(error). Lớp AppError tùy biến gắn kèm mã HTTP status code và thông điệp chuẩn hóa. Trong môi trường production, middleware ẩn chi tiết stack trace để ngăn chặn nguy cơ rò rỉ kiến trúc mã nguồn.")

    doc.add_page_break()

    print("Generating Chapter 6: Implemented Business Workflows...")
    # ==========================================================
    # CHAPTER 6: CÁC LUỒNG NGHIỆP VỤ HỆ THỐNG
    # ==========================================================
    add_heading_1(doc, "CHƯƠNG 6. CÁC LUỒNG NGHIỆP VỤ HỆ THỐNG")

    add_heading_2(doc, "6.1 Luồng Đăng ký và Đăng nhập Ứng viên")
    add_p(doc, "1. Ứng viên truy cập cổng thông tin và chọn 'Register as Candidate'.\n2. Nhập thông tin: Họ tên, Email, Mật khẩu, Xác nhận mật khẩu, Số điện thoại (kiểm tra định dạng số điện thoại Việt Nam bắt đầu bằng 03, 05, 07, 08, 09).\n3. Hệ thống kiểm tra tính duy nhất của Email trong MongoDB. Băm mật khẩu bằng bcrypt.\n4. Tạo tài khoản với vai trò ROLE.CANDIDATE, tự động kích hoạt isActive = true.\n5. Chuyển hướng người dùng đến trang Đăng nhập để nhận JWT cookie phiên làm việc.")

    add_heading_2(doc, "6.2 Luồng Đăng ký Nhà tuyển dụng và Phê duyệt bởi Admin")
    add_p(doc, "1. Doanh nghiệp chọn 'Register as Recruiter'.\n2. Nhập thông tin doanh nghiệp: Tên công ty, Email công ty, Mật khẩu, Số điện thoại, Địa chỉ trụ sở, Website, Mã số đăng ký kinh doanh và Đường dẫn tải giấy phép kinh doanh.\n3. Hệ thống tạo tài khoản với role = RECRUITER, isActive = true và registrationStatus = 'PENDING'.\n4. Khi Recruiter đăng nhập, thanh thông báo trạng thái vàng cảnh báo tài khoản đang chờ Admin xét duyệt.\n5. Admin truy cập trang Quản lý Recruiter (tab Pending Approvals), kiểm tra giấy phép kinh doanh.\n6. Nếu hợp lệ, Admin bấm 'Approve' -> registrationStatus đổi thành 'APPROVED'. Doanh nghiệp nhận đầy đủ quyền xuất bản tin.\n7. Nếu không hợp lệ, Admin bấm 'Reject' và nhập bắt buộc lý do từ chối -> registrationStatus đổi thành 'REJECTED'.")

    add_heading_2(doc, "6.3 Luồng Tạo, Lưu nháp và Xuất bản Tin tuyển dụng")
    add_p(doc, "1. Recruiter đã được duyệt truy cập menu 'Manage Jobs' -> 'Post New Job'.\n2. Nhập tiêu đề, vị trí, cấp bậc, ngành nghề, hình thức làm việc, địa điểm, khoảng lương min/max, số lượng cần tuyển và thời hạn nộp hồ sơ.\n3. Recruiter có 2 lựa chọn:\n   • 'Save Draft': Lưu tin ở trạng thái DRAFT. Tin này chỉ hiển thị với Recruiter, có thể chỉnh sửa mọi trường thông tin.\n   • 'Publish Job': Xuất bản tin thành OPENING. Tin việc làm lập tức xuất hiện trên bảng tin tìm việc công khai.\n4. Cơ chế Cron Scheduler: Mỗi phút, tiến trình cron ngầm (startJobScheduler) tự động quét các tin OPENING có applicationEndDate nhỏ hơn thời điểm hiện tại và chuyển sang trạng thái CLOSED.")

    add_heading_2(doc, "6.4 Luồng Tìm kiếm việc làm và Nộp hồ sơ ứng tuyển")
    add_p(doc, "Hình 6.1 biểu diễn quy trình xuyên suốt từ khi Ứng viên tìm kiếm việc làm đến khi nộp hồ sơ và xem lịch hẹn phỏng vấn:")
    add_image_with_caption(doc, "candidate_workflow_diagram.png", "Hình 6.1: Quy trình Ứng tuyển và Theo dõi hồ sơ của Ứng viên")
    add_p(doc, "Quy trình tải lên và bảo vệ CV ứng viên:\n1. Ứng viên chọn file CV định dạng PDF, DOC hoặc DOCX (dung lượng <= 5MB).\n2. Middleware Multer đọc file vào buffer bộ nhớ RAM (không ghi tệp tạm ra ổ cứng máy chủ nhằm đảm bảo an toàn).\n3. Tải trực tiếp file lên Cloudinary tại thư mục bảo mật `candidate-management/applications/cv/` với resource_type: 'raw' và type: 'authenticated'.\n4. Cloudinary trả về publicId và secure_url. Backend lưu thông tin này vào trường cv của Application.")

    add_heading_2(doc, "6.5 Luồng Sàng lọc hồ sơ CV của Nhà tuyển dụng")
    add_p(doc, "1. Recruiter vào trang chi tiết ứng viên của Job, mặc định hiển thị tab 'All' hoặc chọn tab 'Pending'.\n2. Xem thông tin liên hệ và bấm 'View CV'. Hệ thống tạo Signed URL có hiệu lực 5 phút và hiển thị iframe xem trước trực tiếp trên trình duyệt.\n3. Nếu hồ sơ đạt yêu cầu: Bấm 'Accept CV' -> Trạng thái đổi thành PASSED_CV. Hồ sơ chuyển sang tab 'Passed CV'.\n4. Nếu hồ sơ không phù hợp: Bấm 'Reject CV' -> Trạng thái đổi thành REJECTED_CV. Bản ghi vẫn lưu trữ trong cơ sở dữ liệu và có thể tra cứu lại tại tab 'All'.")

    add_heading_2(doc, "6.6 Luồng Lên lịch và Đánh giá phỏng vấn trực tiếp")
    add_p(doc, "Hình 6.2 mô tả chi tiết quy trình tuyển dụng và đánh giá phỏng vấn của Nhà tuyển dụng:")
    add_image_with_caption(doc, "recruiter_workflow_diagram.png", "Hình 6.2: Quy trình Tuyển dụng và Đánh giá phỏng vấn của Nhà tuyển dụng")
    add_p(doc, "Chi tiết các bước trong quy trình phỏng vấn:\n1. Tại tab 'Passed CV', Recruiter tích chọn danh sách ứng viên và bấm 'Set Scheduler Interview'. Điền ngày giờ, loại hình Online/Offline, link họp hoặc địa chỉ.\n2. Ứng viên chuyển sang tab 'Waiting Interview'. Đồng thời, Ứng viên có thể đăng nhập vào Application Details để xem thông tin lịch hẹn.\n3. Tại buổi phỏng vấn, Recruiter bấm nút 'Interview' -> Hệ thống chuyển đến trang đánh giá 2 cột `InterviewEvaluation` (/recruiter/applications/:id/evaluate).\n4. Cột trái hiển thị hồ sơ ứng viên và tự động nhúng tài liệu CV PDF. Cột phải hiển thị lịch hẹn và textarea ghi chú đánh giá.\n5. Recruiter nhập nhận xét chuyên môn và bấm 'Save Notes & Move to Waiting Result'. Trạng thái chuyển sang INTERVIEWED.\n6. Tại tab 'Waiting Result', Recruiter xem lại kết quả và bấm 'Accept' để chuyển sang PASSED (Offer tuyển dụng) hoặc 'Reject' để chuyển sang REJECTED_INTERVIEW.")

    add_heading_2(doc, "6.7 Luồng Quản trị và Kiểm duyệt tài khoản Recruiter")
    add_p(doc, "1. Admin đăng nhập vào Admin Console, truy cập menu 'Manage Recruiters'.\n2. Tab 'Pending Approvals' hiển thị danh sách các công ty mới đăng ký.\n3. Admin mở modal xem chi tiết, nhấp vào link giấy phép kinh doanh để đối soát thông tin pháp lý.\n4. Thực hiện phê duyệt hoặc từ chối kèm lý do văn bản.\n5. Đối với các tài khoản đang hoạt động, Admin có thể bấm 'Suspend' để khóa tài khoản ngay lập tức hoặc 'Reactivate' để mở khóa.")

    add_heading_2(doc, "6.8 Luồng Kiểm duyệt và Ẩn/Hiện tin việc làm")
    add_p(doc, "1. Admin truy cập menu 'Manage Jobs', theo dõi toàn bộ các tin đăng tuyển trên hệ thống kèm số lượng ứng viên nộp thực tế (applicationCount).\n2. Nếu phát hiện tin tuyển dụng có nội dung sai lệch, lừa đảo hoặc vi phạm chính sách, Admin bấm 'Hide'.\n3. Cờ `isVisible` được đặt thành `false`. Tin việc làm này lập tức bị loại bỏ khỏi kết quả tìm kiếm của ứng viên mà không làm mất dữ liệu của các ứng viên đã nộp đơn trước đó.\n4. Khi doanh nghiệp giải trình hoặc chỉnh sửa hợp lệ, Admin bấm 'Restore' để khôi phục trạng thái hiển thị.")

    doc.add_page_break()

    print("Generating Chapter 7: User Interface & User Guide...")
    # ==========================================================
    # CHAPTER 7: THIẾT KẾ GIAO DIỆN VÀ HƯỚNG DẪN SỬ DỤNG
    # ==========================================================
    add_heading_1(doc, "CHƯƠNG 7. THIẾT KẾ GIAO DIỆN VÀ HƯỚNG DẪN SỬ DỤNG")

    add_heading_2(doc, "7.1 Hướng dẫn dành cho Ứng viên (Candidate User Guide)")
    add_p(doc, "1. Tìm kiếm và Lọc việc làm (/jobs):\n• Nhập chức danh hoặc từ khóa vào thanh tìm kiếm trên cùng.\n• Tại bảng bộ lọc bên trái (TopCV Filter Panel), chọn khoảng lương phù hợp bằng các nút preset (Dưới 10M, 10M - 20M, 20M - 35M, Trên 35M) hoặc nhập khoảng lương tùy chỉnh.\n• Chọn hình thức làm việc (On-site, Remote, Hybrid) và ngành nghề mong muốn.\n• Các tiêu chí đã chọn hiển thị dưới dạng chip lọc có thể xóa nhanh từng tiêu chí hoặc bấm 'Clear all'.")
    add_p(doc, "2. Nộp đơn ứng tuyển (/jobs/:id):\n• Xem kỹ thông tin mô tả, mức lương và hạn nộp hồ sơ.\n• Bấm 'Apply for this position' -> Điền số điện thoại và chọn tệp CV từ máy tính (hỗ trợ .pdf, .doc, .docx).\n• Bấm 'Submit Application' -> Hệ thống hiển thị thông báo thành công và chuyển hướng đến My Applications.")
    add_p(doc, "3. Theo dõi tiến trình ứng tuyển (/candidate/applications):\n• Xem danh sách công việc đã ứng tuyển kèm huy hiệu trạng thái (StatusBadge) màu sắc trực quan.\n• Bấm 'View Detail' để xem chi tiết lịch phỏng vấn khi được nhà tuyển dụng lên lịch hẹn.")
    add_p(doc, "4. Quản lý hồ sơ cá nhân (/candidate/profile):\n• Cập nhật họ tên, số điện thoại, địa chỉ và thực hiện đổi mật khẩu tài khoản.")

    add_heading_2(doc, "7.2 Hướng dẫn dành cho Nhà tuyển dụng (Recruiter User Guide)")
    add_p(doc, "1. Tổng quan Dashboard (/recruiter/dashboard):\n• Theo dõi số liệu thống kê tổng số tin đăng, số tin đang mở, tin nháp và tin đã đóng.\n• Xem bảng các tin tuyển dụng gần đây và số lượng ứng viên nộp đơn tương ứng.")
    add_p(doc, "2. Quản lý và Đăng tin tuyển dụng (/recruiter/jobs):\n• Bấm 'Post New Job' để tạo vị trí tuyển dụng mới.\n• Điền đầy đủ thông tin vào biểu mẫu, chọn lưu nháp hoặc xuất bản trực tiếp.\n• Chỉnh sửa tin nháp, đóng tin đang tuyển hoặc xóa tin khi hoàn tất tuyển dụng.")
    add_p(doc, "3. Quản lý và Sàng lọc ứng viên (/recruiter/jobs/:id/applications):\n• Quản lý ứng viên qua 6 tab trạng thái theo đúng thứ tự: All, Pending, Passed CV, Waiting Interview, Waiting Result, Passed.\n• Tab Pending: Xem CV trực tiếp qua iframe bảo mật, bấm 'Accept CV' hoặc 'Reject CV'.\n• Tab Passed CV: Tích chọn các ứng viên và bấm 'Set Scheduler Interview' để lên lịch hẹn hàng loạt.\n• Tab Waiting Interview: Bấm nút 'Interview' để chuyển đến màn hình chấm điểm phỏng vấn.\n• Trang InterviewEvaluation: Xem CV nhúng bên trái, nhập nhận xét phỏng vấn bên phải và bấm 'Save Notes & Move to Waiting Result'.\n• Tab Waiting Result: Xem lại đánh giá và đưa ra quyết định cuối cùng 'Accept Candidate' hoặc 'Reject Candidate'.")

    add_heading_2(doc, "7.3 Hướng dẫn dành cho Quản trị viên (Admin User Guide)")
    add_p(doc, "1. Xét duyệt tài khoản Doanh nghiệp (/admin/recruiters):\n• Theo dõi 4 tab: All, Pending Approvals, Active, Suspended với số lượng đếm thực tế từ cơ sở dữ liệu.\n• Tại tab Pending Approvals, bấm 'Details' để kiểm tra thông tin pháp lý và file giấy phép kinh doanh.\n• Bấm 'Approve' để duyệt hoặc 'Reject' (bắt buộc nhập lý do từ chối vào hộp thoại).\n• Bấm 'Suspend' để đình chỉ hoặc 'Reactivate' để kích hoạt lại tài khoản.")
    add_p(doc, "2. Quản lý và Kiểm duyệt việc làm (/admin/jobs):\n• Theo dõi toàn bộ danh sách việc làm trên sàn, hiển thị số lượng ứng viên đã nộp đơn.\n• Bấm 'Details' để đọc mô tả chi tiết công việc.\n• Bấm 'Hide' để ẩn tin tuyển dụng vi phạm, bấm 'Restore' để khôi phục hiển thị.")

    add_heading_2(doc, "7.4 Thiết kế hệ thống giao diện và trải nghiệm người dùng (UI/UX)")
    add_p(doc, "Giao diện TalentPulse được chuẩn hóa theo hệ thống Design Tokens nhất quán:")
    add_bullet(doc, "Bảng màu chủ đạo (Color Palette):", "Deep Teal (#0F766E - màu sắc chủ đạo thể hiện sự tin cậy, chuyên nghiệp), Dark Navy (#0F172A - màu nền thanh điều hướng và văn bản tiêu đề), Neutral Slate (#F8FAFC / #F1F5F9 - màu nền giao diện và bề mặt khối nội dung), Accent Colors (Emerald cho chấp nhận/thành công, Rose cho từ chối/cảnh báo, Amber cho chờ duyệt).")
    add_bullet(doc, "Kiến trúc hiển thị thông tin:", "Sử dụng các thẻ Card có bo góc bo tròn (rounded-2xl), đường viền mảnh (border-slate-200), đổ bóng tinh tế (shadow-sm) và hiệu ứng chuyển đổi trạng thái mượt mà (transition-colors).")
    add_bullet(doc, "Tính tương thích thiết bị (Responsive Design):", "Tự động co giãn theo Grid và Flexbox linh hoạt, thanh điều hướng dạng ngăn kéo (Drawer menu) trên thiết bị di động, bảng dữ liệu hỗ trợ cuộn ngang overflow-x-auto trên màn hình nhỏ.")

    doc.add_page_break()

    print("Generating Chapter 8: Testing...")
    # ==========================================================
    # CHAPTER 8: KIỂM THỬ HỆ THỐNG
    # ==========================================================
    add_heading_1(doc, "CHƯƠNG 8. KIỂM THỬ HỆ THỐNG")

    add_heading_2(doc, "8.1 Tổng quan chiến lược kiểm thử")
    add_p(doc, "Hệ thống TalentPulse được kiểm thử theo phương pháp Kiểm thử chức năng toàn diện (Functional End-to-End Testing) và Kiểm thử tích hợp API (Integration Testing). Các kịch bản kiểm thử tập trung vào việc xác minh tính đúng đắn của logic nghiệp vụ, tính toàn vẹn dữ liệu, cơ chế phân quyền bảo mật và khả năng xử lý ngoại lệ của hệ thống.")

    add_heading_2(doc, "8.2 Bảng Test Cases chi tiết và kết quả thực nghiệm")
    add_p(doc, "Bảng dưới đây trình bày 15 trường hợp kiểm thử trọng tâm đã được thực thi và kiểm định trực tiếp trên hệ thống:")

    test_cases_data = [
        ("TC01", "Đăng ký Ứng viên", "Đăng ký tài khoản với email mới và SĐT hợp lệ", "Email: can1@fpt.edu.vn, Phone: 0912345678", "Tạo tài khoản thành công, lưu User vào DB với role CANDIDATE", "Tạo tài khoản thành công, mã HTTP 201 Created", "Passed"),
        ("TC02", "Đăng ký Trùng Email", "Đăng ký với email đã tồn tại trong hệ thống", "Email: can1@fpt.edu.vn (đã có)", "Hệ thống từ chối đăng ký, thông báo email đã được sử dụng", "Báo lỗi 400 'Email already registered'", "Passed"),
        ("TC03", "Đăng nhập & Cấp Token", "Đăng nhập với email và mật khẩu chính xác", "Email: can1@fpt.edu.vn, Pass: Password@123", "Xác thực thành công, trả về HTTP-only Cookie 'token'", "Đăng nhập thành công, Cookie token được thiết lập an toàn", "Passed"),
        ("TC04", "Phân quyền Truy cập (RBAC)", "Ứng viên cố tình gọi API tạo việc làm của Recruiter", "Token role CANDIDATE gọi POST /api/jobs", "Middleware authorize chặn request, trả về mã lỗi 403 Forbidden", "Bị chặn với mã lỗi 403 'Access forbidden'", "Passed"),
        ("TC05", "Recruiter Chưa Duyệt Tạo Job", "Recruiter ở trạng thái PENDING cố tình xuất bản việc làm", "Recruiter PENDING gọi POST /api/jobs (OPENING)", "Hệ thống từ chối với thông báo Recruiter chưa được phê duyệt", "Báo lỗi 403 'Recruiter account not approved'", "Passed"),
        ("TC06", "Admin Duyệt Recruiter", "Admin phê duyệt đăng ký tài khoản Recruiter", "PATCH /api/admin/recruiters/:id/review { status: 'APPROVED' }", "Cập nhật registrationStatus = 'APPROVED', Recruiter được mở quyền", "Cập nhật thành công status = 'APPROVED'", "Passed"),
        ("TC07", "Admin Từ chối Recruiter", "Admin từ chối Recruiter nhưng không cung cấp lý do", "PATCH review { status: 'REJECTED', reason: '' }", "Hệ thống bắt buộc nhập lý do từ chối, từ chối cập nhật", "Báo lỗi validation yêu cầu cung cấp lý do từ chối", "Passed"),
        ("TC08", "Bộ lọc Lương Chồng chéo", "Tìm việc với khoảng lương 15M - 25M VNĐ", "Params: salaryMin=15000000, salaryMax=25000000", "Trả về các Job có khoảng lương [salaryMin, salaryMax] giao thoa", "Trả về chính xác danh sách các công việc thỏa mãn giao thoa", "Passed"),
        ("TC09", "Nộp đơn & Upload File CV", "Ứng viên nộp file PDF 2MB hợp lệ", "Form-data: file Resume.pdf (2MB)", "File tải lên Cloudinary thành công, tạo bản ghi Application APPLIED", "Tạo Application thành công, lưu URL Cloudinary", "Passed"),
        ("TC10", "Chặn File CV Quá Dung lượng", "Ứng viên nộp file CV kích thước 8MB (> 5MB)", "Form-data: file Heavy_CV.pdf (8MB)", "Multer middleware chặn lại, không ghi lên Cloudinary", "Báo lỗi 400 dung lượng file vượt quá giới hạn 5MB", "Passed"),
        ("TC11", "Xem trước CV Bảo mật (Preview)", "Recruiter bấm xem trước CV dạng PDF", "GET /api/applications/:id/cv?disposition=inline", "Tạo Signed URL tạm thời 5 phút, iframe hiển thị tài liệu PDF", "Blob URL tạo thành công, PDF nhúng xem tốt", "Passed"),
        ("TC12", "Sàng lọc Chấp nhận CV", "Recruiter duyệt CV ứng viên ở tab Pending", "PATCH /api/applications/:id/status { status: 'PASSED_CV' }", "Cập nhật status = PASSED_CV, ứng viên chuyển sang tab Passed CV", "Cập nhật thành công, tab count cập nhật chính xác", "Passed"),
        ("TC13", "Lên lịch Phỏng vấn Hàng loạt", "Recruiter lên lịch cho 2 ứng viên ở Passed CV", "POST /api/interviews/bulk-schedule (startTime, endTime, ONLINE)", "Tạo bản ghi Interview cho từng ứng viên, status -> WAITING_INTERVIEW", "Tạo 2 interview records thành công, status cập nhật", "Passed"),
        ("TC14", "Đánh giá Phỏng vấn 2 Cột", "Recruiter chấm điểm tại trang InterviewEvaluation", "POST /api/interviews/applications/:id/evaluate { notes: 'Tốt' }", "Lưu notes vào Interview, Application chuyển sang INTERVIEWED", "Lưu ghi chú thành công, ứng viên chuyển sang Waiting Result", "Passed"),
        ("TC15", "Đình chỉ Tài khoản Doanh nghiệp", "Admin đình chỉ hoạt động tài khoản Recruiter vi phạm", "PATCH /api/admin/recruiters/:id/suspend", "Cập nhật isActive = false, mọi request tiếp theo của Recruiter bị 401", "Tài khoản bị khóa, các phiên gọi API bị chặn 401", "Passed")
    ]

    tc_tbl = doc.add_table(rows=1, cols=7)
    tc_tbl.rows[0].cells[0].paragraphs[0].text = "Mã TC"
    tc_tbl.rows[0].cells[1].paragraphs[0].text = "Chức năng"
    tc_tbl.rows[0].cells[2].paragraphs[0].text = "Kịch bản kiểm thử"
    tc_tbl.rows[0].cells[3].paragraphs[0].text = "Dữ liệu kiểm thử"
    tc_tbl.rows[0].cells[4].paragraphs[0].text = "Kết quả mong đợi"
    tc_tbl.rows[0].cells[5].paragraphs[0].text = "Kết quả thực tế"
    tc_tbl.rows[0].cells[6].paragraphs[0].text = "Trạng thái"

    for row in test_cases_data:
        r = tc_tbl.add_row()
        for idx, text in enumerate(row):
            r.cells[idx].paragraphs[0].text = text

    format_table(tc_tbl, col_widths=[0.6, 1.1, 1.3, 1.1, 1.3, 1.1, 0.6])

    add_heading_2(doc, "8.3 Kiểm thử bảo mật và Kiểm soát truy cập (Security Testing)")
    add_bullet(doc, "Kiểm thử giả mạo Cookie (Tampering Test):", "Thử nghiệm sửa đổi payload của JWT cookie hoặc gửi cookie rỗng -> Middleware `auth.protect` phát hiện token không hợp lệ và trả về mã lỗi 401 Unauthorized.")
    add_bullet(doc, "Kiểm thử phân quyền chéo (Horizontal Access Control):", "Recruiter A cố tình truy cập đơn ứng tuyển của công việc thuộc sở hữu Recruiter B -> Hệ thống kiểm tra quyền sở hữu `job.recruiterId === req.user.id` và chặn lại với mã lỗi 403 Forbidden.")
    add_bullet(doc, "Kiểm thử ẩn danh tài liệu nhạy cảm:", "Candidate gọi GET /api/applications/:id -> Controller chỉ trả về thông tin lịch hẹn (ngày giờ, link họp, địa điểm) và tuyệt đối loại bỏ trường `notes` nội bộ của nhà tuyển dụng.")

    add_heading_2(doc, "8.4 Các hạn chế và chức năng đã ghi nhận")
    add_p(doc, "Trong quá trình kiểm thử và rà soát hệ thống, một số hạn chế kỹ thuật hiện tại đã được ghi nhận trung thực:")
    add_bullet(doc, "Cơ chế gửi Email thông báo:", "Hệ thống đã có model EmailLog và cấu hình Nodemailer nhưng hiện tại chưa kết nối tài khoản SMTP thực tế trong file môi trường, do đó việc gửi thông báo email tự động khi lên lịch phỏng vấn đang tạm thời được ghi nhận nhật ký cục bộ.")
    add_bullet(doc, "Xem trước tài liệu Word (.docx):", "Trình duyệt web hiện tại không hỗ trợ render trực tiếp file Word trong thẻ iframe như file PDF; do đó hệ thống hỗ trợ nút tải file trực tiếp (Direct Download) cho các tệp Word thay vì xem nội dòng.")

    doc.add_page_break()

    print("Generating Chapter 9: Installation & Deployment...")
    # ==========================================================
    # CHAPTER 9: HƯỚNG DẪN CÀI ĐẶT VÀ TRIỂN KHAI
    # ==========================================================
    add_heading_1(doc, "CHƯƠNG 9. HƯỚNG DẪN CÀI ĐẶT VÀ TRIỂN KHAI")

    add_heading_2(doc, "9.1 Yêu cầu hệ thống và Tiền đề kỹ thuật")
    add_bullet(doc, "Môi trường thực thi:", "Node.js phiên bản LTS v18.0.0 trở lên (khuyến nghị Node.js v20+ hoặc v24) kèm npm v9+.")
    add_bullet(doc, "Cơ sở dữ liệu:", "MongoDB Server phiên bản v6.0 trở lên chạy cục bộ (Localhost) hoặc dịch vụ đám mây MongoDB Atlas.")
    add_bullet(doc, "Tài khoản dịch vụ lưu trữ:", "Tài khoản Cloudinary miễn phí để lấy Cloud Name, API Key và API Secret phục vụ tải file CV.")

    add_heading_2(doc, "9.2 Bảng cấu hình biến môi trường chi tiết (.env)")
    add_p(doc, "Tạo file `.env` tại thư mục `backend/` với các tham số bắt buộc sau:")

    env_data = [
        ("PORT", "Cổng lắng nghe của máy chủ Express (Mặc định: 8080)", "Có", "8080"),
        ("NODE_ENV", "Môi trường thực thi: development hoặc production", "Có", "development"),
        ("CLIENT_URL", "URL gốc của ứng dụng Frontend để cấu hình CORS", "Có", "http://localhost:5173"),
        ("MONGODB_URI", "Chuỗi kết nối kết nối cơ sở dữ liệu MongoDB", "Có", "mongodb://127.0.0.1:27017/candidate_management"),
        ("JWT_SECRET", "Khóa bí mật dùng để ký và xác minh chữ ký số JWT", "Có", "talentpulse_secret_key_sdn392"),
        ("JWT_EXPIRES_IN", "Thời hạn hiệu lực của mã token xác thực", "Không", "1d"),
        ("CLOUDINARY_CLOUD_NAME", "Tên Cloud trên bảng điều khiển Cloudinary", "Có", "your_cloud_name"),
        ("CLOUDINARY_API_KEY", "Khóa API Key của Cloudinary", "Có", "your_api_key"),
        ("CLOUDINARY_API_SECRET", "Khóa bí mật API Secret của Cloudinary", "Có", "your_api_secret"),
        ("EMAIL_HOST / PORT", "Cấu hình máy chủ SMTP phục vụ gửi email", "Không", "smtp.gmail.com / 587"),
        ("EMAIL_USER / PASSWORD", "Tài khoản và App Password gửi mail", "Không", "no-reply@talentpulse.com")
    ]

    env_tbl = doc.add_table(rows=1, cols=4)
    env_tbl.rows[0].cells[0].paragraphs[0].text = "Tên biến môi trường"
    env_tbl.rows[0].cells[1].paragraphs[0].text = "Mục đích sử dụng"
    env_tbl.rows[0].cells[2].paragraphs[0].text = "Bắt buộc"
    env_tbl.rows[0].cells[3].paragraphs[0].text = "Giá trị mẫu an toàn"
    for row in env_data:
        r = env_tbl.add_row()
        for idx, text in enumerate(row):
            r.cells[idx].paragraphs[0].text = text
    format_table(env_tbl, col_widths=[2.0, 2.7, 0.8, 1.6])

    add_p(doc, "Tạo file `.env` tại thư mục `frontend/`:")
    add_code_block(doc, "VITE_API_URL=http://localhost:8080/api")

    add_heading_2(doc, "9.3 Cài đặt và Khởi chạy Backend")
    add_p(doc, "Mở terminal tại thư mục gốc của dự án và thực hiện các lệnh sau:")
    add_code_block(doc,
"""# 1. Điều hướng vào thư mục backend
cd backend

# 2. Cài đặt các gói phụ thuộc (Dependencies)
npm install

# 3. Khởi chạy máy chủ Backend ở chế độ phát triển (Nodemon)
npm run dev

# Máy chủ sẽ khởi động và thông báo:
# [Job Scheduler] Started successfully
# Database connected: candidate_management
# Server running on port 8080""")

    add_heading_2(doc, "9.4 Cài đặt và Khởi chạy Frontend")
    add_p(doc, "Mở một cửa sổ terminal mới và thực hiện:")
    add_code_block(doc,
"""# 1. Điều hướng vào thư mục frontend
cd frontend

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Khởi chạy máy chủ phát triển Vite
npm run dev

# Ứng dụng web sẽ khả dụng tại: http://localhost:5173

# 4. Đóng gói cho môi trường Production (Build test)
npm run build
# Kết quả đóng gói được xuất ra thư mục frontend/dist/""")

    add_heading_2(doc, "9.5 Khởi tạo cơ sở dữ liệu MongoDB")
    add_p(doc, "1. Đảm bảo dịch vụ MongoDB Daemon (mongod) đang chạy trên cổng 27017.\n2. Khi Backend khởi động lần đầu, Mongoose sẽ tự động kết nối và tạo cơ sở dữ liệu `candidate_management`.\n3. Các chỉ mục Indexes (Unique Index cho email, Index cho job search và compound index cho application) được tự động đăng ký vào MongoDB.")

    add_heading_2(doc, "9.6 Các lưu ý triển khai môi trường Production")
    add_bullet(doc, "Bảo mật Cookie qua giao thức HTTPS:", "Trong môi trường Production (`NODE_ENV=production`), cờ `secure: true` phải được bật trong cookie-parser để đảm bảo cookie JWT chỉ truyền qua kết nối SSL/TLS mã hóa.")
    add_bullet(doc, "Cấu hình Nginx Reverse Proxy:", "Sử dụng Nginx làm web server phía trước điều hướng tĩnh các tệp `frontend/dist` và chuyển tiếp các yêu cầu có tiền tố `/api` đến dịch vụ Node.js chạy ngầm qua PM2.")
    add_bullet(doc, "Quản lý tiến trình bằng PM2:", "Chạy lệnh `pm2 start src/server.js --name talentpulse-api` để tự động khởi động lại server khi gặp sự cố hoặc khi máy chủ vật lý khởi động lại.")

    doc.add_page_break()

    print("Generating Chapter 10: Conclusion & Future Work...")
    # ==========================================================
    # CHAPTER 10: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
    # ==========================================================
    add_heading_1(doc, "CHƯƠNG 10. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN")

    add_heading_2(doc, "10.1 Kết quả đạt được của dự án")
    add_p(doc, "Dự án TalentPulse đã hoàn thành xuất sắc các mục tiêu nghiên cứu và phát triển hệ thống quản lý tuyển dụng:")
    add_bullet(doc, "Hoàn thiện hệ sinh thái phân quyền 3 vai trò:", "Xây dựng cổng thông tin chuyên nghiệp cho Ứng viên, Nhà tuyển dụng và Quản trị viên với cơ chế phân quyền RBAC và xác thực cookie an toàn.")
    add_bullet(doc, "Chuẩn hóa quy trình tuyển dụng 6 bước khép kín:", "Hiện thực hóa quy trình từ Đăng tin -> Ứng tuyển & Tải CV -> Sàng lọc hồ sơ -> Lên lịch hẹn -> Đánh giá phỏng vấn 2 cột -> Quyết định trúng tuyển.")
    add_bullet(doc, "Giải quyết dứt điểm bài toán xem trước và tải CV:", "Ứng dụng giải pháp Private Download URL và nhúng iframe PDF bảo mật, xử lý linh hoạt định dạng tài liệu Word, đảm bảo không rò rỉ khóa xác thực Cloudinary.")
    add_bullet(doc, "Nâng cấp toàn diện trải nghiệm người dùng:", "Hệ màu sắc Deep Teal hiện đại, bộ lọc việc làm linh hoạt theo chuẩn TopCV, và cơ chế tự động hóa đóng tin quá hạn bằng tiến trình Cron Scheduler.")

    add_heading_2(doc, "10.2 Các hạn chế hiện tại của hệ thống")
    add_bullet(doc, "Chưa tích hợp công cụ phỏng vấn trực tiếp:", "Lịch hẹn phỏng vấn Online hiện đang liên kết với các nền tảng bên ngoài (Google Meet, Zoom, MS Teams) qua đường dẫn URL chứ chưa nhúng phòng họp video trực tiếp.")
    add_bullet(doc, "Thông báo Email chưa tích hợp SMTP thực:", "Hệ thống mới ghi nhận nhật ký EmailLog, cần bổ sung cấu hình máy chủ gửi mail thực tế để gửi email thông báo tự động cho ứng viên.")

    add_heading_2(doc, "10.3 Định hướng phát triển trong tương lai")
    add_bullet(doc, "Ứng dụng Trí tuệ nhân tạo (AI Resume Matching):", "Tích hợp mô hình AI (Large Language Models) để tự động trích xuất thông tin kỹ năng trong CV và chấm điểm độ phù hợp (Match Score) giữa CV ứng viên và mô tả công việc (Job Description).")
    add_bullet(doc, "Hệ thống thông báo thời gian thực (Real-time WebSockets):", "Tích hợp Socket.io để gửi thông báo tức thời (Push Notification) đến ứng viên ngay khi CV được duyệt hoặc lịch phỏng vấn được thiết lập.")
    add_bullet(doc, "Tích hợp phòng phỏng vấn trực tuyến (WebRTC):", "Xây dựng tính năng gọi video call tích hợp trực tiếp trên nền tảng TalentPulse hỗ trợ ghi âm và chia sẻ màn hình làm bài kiểm tra chuyên môn.")

    # Save document
    print(f"Saving Word document to: {DOCX_PATH}")
    doc.save(DOCX_PATH)
    print("DOCX generated successfully!")

if __name__ == "__main__":
    create_full_documentation()
