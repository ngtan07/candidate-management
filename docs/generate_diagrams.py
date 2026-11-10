import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Ensure diagrams directory exists
output_dir = r"d:\01.FU\SEM 7\SDN392\00.project\candidate-managerment\docs\diagrams"
os.makedirs(output_dir, exist_ok=True)

# Common styling constants
TEAL_DARK = "#0F766E"
TEAL_LIGHT = "#E6FFFA"
TEAL_MID = "#14B8A6"
SLATE_DARK = "#0F172A"
SLATE_MID = "#334155"
SLATE_LIGHT = "#F8FAFC"
WHITE = "#FFFFFF"
AMBER = "#D97706"
EMERALD = "#059669"
ROSE = "#E11D48"
BLUE = "#2563EB"

def draw_box(ax, x, y, w, h, text, title=None, color=TEAL_LIGHT, edgecolor=TEAL_DARK, radius=0.02, fontsize=8.5, title_fontsize=9.5, bold_title=True):
    box = patches.FancyBboxPatch(
        (x, y), w, h,
        boxstyle=f"round,pad=0.01,rounding_size={radius}",
        facecolor=color, edgecolor=edgecolor, linewidth=1.5
    )
    ax.add_patch(box)
    
    if title:
        ax.text(x + w/2, y + h - 0.03, title, ha='center', va='top', fontsize=title_fontsize, fontweight='bold' if bold_title else 'normal', color=SLATE_DARK)
        if text:
            ax.text(x + w/2, y + (h - 0.05)/2, text, ha='center', va='center', fontsize=fontsize, color=SLATE_MID)
    else:
        ax.text(x + w/2, y + h/2, text, ha='center', va='center', fontsize=fontsize, color=SLATE_DARK, fontweight='bold')

def draw_arrow(ax, x1, y1, x2, y2, label="", color=SLATE_MID, style='->', lw=1.5):
    ax.annotate(
        label, xy=(x2, y2), xytext=(x1, y1),
        arrowprops=dict(arrowstyle=style, color=color, lw=lw, shrinkA=3, shrinkB=3),
        ha='center', va='center', fontsize=8, color=SLATE_MID, backgroundcolor=WHITE
    )

# -------------------------------------------------------------
# 1. USE CASE DIAGRAM
# -------------------------------------------------------------
def create_use_case_diagram():
    fig, ax = plt.subplots(figsize=(12, 8.5), dpi=300)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    
    # Title
    ax.text(0.5, 0.97, "USE CASE DIAGRAM — HỆ THỐNG TALENTPULSE", ha='center', va='center', fontsize=13, fontweight='bold', color=SLATE_DARK)
    
    # System boundary box
    sys_box = patches.FancyBboxPatch((0.24, 0.03), 0.52, 0.90, boxstyle="round,pad=0.01,rounding_size=0.02", facecolor="#F1F5F9", edgecolor=TEAL_DARK, linewidth=2, linestyle='--')
    ax.add_patch(sys_box)
    ax.text(0.5, 0.90, "TalentPulse Platform Boundary", ha='center', va='center', fontsize=11, fontweight='bold', color=TEAL_DARK)

    # Actor 1: Candidate (Left top)
    draw_box(ax, 0.02, 0.65, 0.18, 0.19, "• Tìm việc & Lọc đa tiêu chí\n• Ứng tuyển & Upload CV\n• Xem My Applications\n• Xem chi tiết lịch phỏng vấn\n• Cập nhật Profile cá nhân", "ACTOR: CANDIDATE\n(Ứng viên)", color="#EFF6FF", edgecolor=BLUE)

    # Actor 2: Recruiter (Right top/mid)
    draw_box(ax, 0.79, 0.40, 0.19, 0.35, "• Đăng ký & chờ Admin duyệt\n• Quản lý Job (Tạo, Sửa, Đóng)\n• Lọc ứng viên theo 6 giai đoạn\n• Xem CV bảo mật (Signed URL)\n• Duyệt / Từ chối hồ sơ CV\n• Lên lịch phỏng vấn (Bulk)\n• Đánh giá ứng viên (Evaluation)\n• Quyết định tuyển dụng (Offer)", "ACTOR: RECRUITER\n(Nhà tuyển dụng)", color="#F0FDF4", edgecolor=EMERALD)

    # Actor 3: Admin (Left bottom)
    draw_box(ax, 0.02, 0.15, 0.18, 0.23, "• Xem Recruiter đăng ký\n• Phê duyệt / Từ chối (Lý do)\n• Đình chỉ / Kích hoạt Account\n• Giám sát danh sách việc làm\n• Ẩn / Khôi phục hiển thị Job", "ACTOR: ADMIN\n(Quản trị hệ thống)", color="#FEF2F2", edgecolor=ROSE)

    # System Use Cases (Ovals in middle)
    ucs = [
        (0.28, 0.82, 0.44, 0.055, "UC01: Đăng ký / Đăng nhập / Đổi & Quên mật khẩu"),
        (0.28, 0.74, 0.44, 0.055, "UC02: Tìm kiếm & Lọc tin tuyển dụng (TopCV Filter)"),
        (0.28, 0.66, 0.44, 0.055, "UC03: Nộp hồ sơ ứng tuyển & Upload CV lên Cloudinary"),
        (0.28, 0.58, 0.44, 0.055, "UC04: Quản lý tin tuyển dụng (Draft, Opening, Closed, Auto-close)"),
        (0.28, 0.50, 0.44, 0.055, "UC05: Sàng lọc CV ứng viên (Accept / Reject CV & Preview PDF)"),
        (0.28, 0.42, 0.44, 0.055, "UC06: Lên lịch phỏng vấn (Bulk Schedule Online/Onsite)"),
        (0.28, 0.34, 0.44, 0.055, "UC07: Đánh giá phỏng vấn & Lưu Notes (Chuyển Waiting Result)"),
        (0.28, 0.26, 0.44, 0.055, "UC08: Ra quyết định tuyển dụng cuối cùng (Offer / Reject)"),
        (0.28, 0.18, 0.44, 0.055, "UC09: Quản lý, Phê duyệt & Đình chỉ tài khoản Recruiter"),
        (0.28, 0.10, 0.44, 0.055, "UC10: Kiểm duyệt & Quản lý hiển thị tin việc làm (Hide/Restore)"),
    ]

    for x, y, w, h, text in ucs:
        box = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.01,rounding_size=0.03", facecolor=WHITE, edgecolor=TEAL_DARK, linewidth=1.2)
        ax.add_patch(box)
        ax.text(x + w/2, y + h/2, text, ha='center', va='center', fontsize=8, fontweight='bold', color=SLATE_DARK)

    # Connections
    # Candidate -> UC01, UC02, UC03
    draw_arrow(ax, 0.20, 0.74, 0.28, 0.84, color=BLUE)
    draw_arrow(ax, 0.20, 0.73, 0.28, 0.76, color=BLUE)
    draw_arrow(ax, 0.20, 0.70, 0.28, 0.68, color=BLUE)

    # Recruiter -> UC01, UC04, UC05, UC06, UC07, UC08
    draw_arrow(ax, 0.79, 0.65, 0.72, 0.83, color=EMERALD)
    draw_arrow(ax, 0.79, 0.62, 0.72, 0.60, color=EMERALD)
    draw_arrow(ax, 0.79, 0.57, 0.72, 0.52, color=EMERALD)
    draw_arrow(ax, 0.79, 0.52, 0.72, 0.44, color=EMERALD)
    draw_arrow(ax, 0.79, 0.47, 0.72, 0.36, color=EMERALD)
    draw_arrow(ax, 0.79, 0.43, 0.72, 0.28, color=EMERALD)

    # Admin -> UC01, UC09, UC10
    draw_arrow(ax, 0.20, 0.28, 0.28, 0.82, color=ROSE)
    draw_arrow(ax, 0.20, 0.24, 0.28, 0.20, color=ROSE)
    draw_arrow(ax, 0.20, 0.18, 0.28, 0.12, color=ROSE)

    plt.tight_layout()
    fig.savefig(os.path.join(output_dir, "use_case_diagram.png"), bbox_inches='tight')
    plt.close(fig)
    print("Created use_case_diagram.png")

# -------------------------------------------------------------
# 2. SYSTEM ARCHITECTURE DIAGRAM
# -------------------------------------------------------------
def create_system_architecture_diagram():
    fig, ax = plt.subplots(figsize=(13, 8.5), dpi=300)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.97, "KIẾN TRÚC HỆ THỐNG TALENTPULSE (3-TIER DECOUPLED ARCHITECTURE)", ha='center', va='center', fontsize=13, fontweight='bold', color=SLATE_DARK)

    # Tier 1: Client Tier
    draw_box(ax, 0.04, 0.68, 0.92, 0.24, "", "1. PRESENTATION TIER (FRONTEND SPA - REACT & VITE)", color="#F0FDFA", edgecolor=TEAL_DARK)
    draw_box(ax, 0.06, 0.70, 0.26, 0.16, "• Candidate Portal (Browse, Apply, Profile)\n• Recruiter Portal (Dashboard, Jobs, Applicants)\n• Admin Console (Recruiters, Jobs Moderation)", "React 18 & React Router DOM v6", color=WHITE, edgecolor=TEAL_MID)
    draw_box(ax, 0.35, 0.70, 0.28, 0.16, "• Tailwind CSS v3 (Deep Teal & Navy System)\n• Lucide React Icons\n• Reusable UI (Modal, Button, Input, Select)\n• CV Embed Viewer & TopCV Filter Panel", "UI & Component Design System", color=WHITE, edgecolor=TEAL_MID)
    draw_box(ax, 0.66, 0.70, 0.28, 0.16, "• AuthContext (Persistent Session)\n• Axios Instance with Interceptors\n• Blob Handling (createObjectURL / Revoke)\n• React Hot Toast Notifications", "State & API Integration Layer", color=WHITE, edgecolor=TEAL_MID)

    # Communication Arrow
    draw_arrow(ax, 0.5, 0.68, 0.5, 0.61, "RESTful API (JSON) + Multipart Form-data (CV Upload) + HTTP-only JWT Cookie", color=TEAL_DARK, lw=2)

    # Tier 2: Application Tier (Backend)
    draw_box(ax, 0.04, 0.28, 0.92, 0.32, "", "2. APPLICATION TIER (REST API ENGINE - NODE.JS & EXPRESS)", color="#F8FAFC", edgecolor=SLATE_MID)
    draw_box(ax, 0.06, 0.30, 0.17, 0.24, "• Helmet (CSP frame-src)\n• CORS (Credentials True)\n• Cookie-Parser\n• Morgan HTTP Logger\n• Rate Limiters", "Security & Gateways", color=WHITE, edgecolor=SLATE_MID)
    draw_box(ax, 0.25, 0.30, 0.22, 0.24, "• Auth Routes (/api/auth)\n• Job Routes (/api/jobs)\n• Application Routes (/api/applications)\n• Interview Routes (/api/interviews)\n• Admin Routes (/api/admin)\n• User Routes (/api)", "Express Route Handlers", color=WHITE, edgecolor=SLATE_MID)
    draw_box(ax, 0.49, 0.30, 0.22, 0.24, "• Auth & Role Check (protect/authorize)\n• Input Validation (express-validator)\n• Multer Memory Upload (5MB PDF/Word)\n• Global AppError & Error Middleware", "Middlewares & Validators", color=WHITE, edgecolor=SLATE_MID)
    draw_box(ax, 0.73, 0.30, 0.21, 0.24, "• AuthService (bcrypt, JWT)\n• JobService & ApplicationService\n• InterviewService (Evaluate & Schedule)\n• AdminService (Review & Moderate)\n• Cron: Auto-close Expired Jobs", "Services & Business Logic", color=WHITE, edgecolor=SLATE_MID)

    # Lower arrows
    draw_arrow(ax, 0.3, 0.28, 0.3, 0.21, "Mongoose ODM (BSON Data)", color=TEAL_DARK, lw=1.8)
    draw_arrow(ax, 0.7, 0.28, 0.7, 0.21, "Cloudinary SDK API / Signed URLs", color=BLUE, lw=1.8)

    # Tier 3: Data Tier
    draw_box(ax, 0.04, 0.04, 0.92, 0.16, "", "3. DATA & CLOUD STORAGE TIER", color="#EFF6FF", edgecolor=BLUE)
    draw_box(ax, 0.06, 0.06, 0.42, 0.10, "• Users Collection (Roles, Profiles, Status)\n• Jobs Collection (Draft, Opening, Closed)\n• Applications Collection (Status History, CV Meta)\n• Interviews Collection (Schedule, Evaluation Notes)", "MongoDB Database (Collections)", color=WHITE, edgecolor=BLUE)
    draw_box(ax, 0.52, 0.06, 0.42, 0.10, "• Authenticated Raw Upload for CVs (PDF / DOC / DOCX)\n• Private Document Signing & Streaming Pipeline\n• Recruiter Business License Document Storage", "Cloudinary Storage Service", color=WHITE, edgecolor=BLUE)

    plt.tight_layout()
    fig.savefig(os.path.join(output_dir, "system_architecture_diagram.png"), bbox_inches='tight')
    plt.close(fig)
    print("Created system_architecture_diagram.png")

# -------------------------------------------------------------
# 3. ENTITY RELATIONSHIP DIAGRAM (ERD)
# -------------------------------------------------------------
def create_erd_diagram():
    fig, ax = plt.subplots(figsize=(14, 9.5), dpi=300)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.98, "SƠ ĐỒ THỰC THỂ LIÊN KẾT (ENTITY RELATIONSHIP DIAGRAM - TALENTPULSE)", ha='center', va='center', fontsize=13, fontweight='bold', color=SLATE_DARK)

    # 1. User
    draw_box(ax, 0.03, 0.46, 0.28, 0.46, 
             "• _id: ObjectId (PK)\n• role: Enum (CANDIDATE, RECRUITER, ADMIN)\n• email: String (Unique, Indexed)\n• passwordHash: String\n• fullName: String (Candidate)\n• companyName: String (Recruiter)\n• phone, address, website: String\n• businessRegistrationNumber: String\n• businessLicenseUrl: String\n• registrationStatus: Enum (PENDING, APPROVED, REJECTED)\n• isActive: Boolean (Default: true)\n• rejectionReason: String\n• reviewedBy: ObjectId (FK -> User)\n• reviewedAt: Date",
             "USER", color="#F0FDFA", edgecolor=TEAL_DARK, fontsize=8)

    # 2. Job
    draw_box(ax, 0.38, 0.46, 0.28, 0.46,
             "• _id: ObjectId (PK)\n• recruiterId: ObjectId (FK -> User)\n• title: String (Max 150)\n• description: String\n• category: Enum (IT, Business, Sales...)\n• employmentType: Enum (Full-time...)\n• experienceLevel: Enum (Fresher...)\n• workLocationType: Enum (Onsite, Remote...)\n• location: String\n• salaryMin, salaryMax: Number\n• salaryCurrency: Enum (VND, USD)\n• numberOfPositions: Number\n• applicationStartDate, applicationEndDate: Date\n• status: Enum (DRAFT, OPENING, CLOSED)\n• isVisible: Boolean, isDeleted: Boolean",
             "JOB", color="#EFF6FF", edgecolor=BLUE, fontsize=8)

    # 3. Application
    draw_box(ax, 0.71, 0.46, 0.26, 0.46,
             "• _id: ObjectId (PK)\n• candidateId: ObjectId (FK -> User)\n• jobId: ObjectId (FK -> Job)\n• applicantName: String\n• applicantEmail: String\n• applicantPhone: String\n• cv: Object {\n    url: String,\n    publicId: String,\n    fileName: String\n  }\n• status: Enum (\n    APPLIED, PASSED_CV, REJECTED_CV,\n    WAITING_INTERVIEW, INTERVIEWED,\n    PASSED, REJECTED_INTERVIEW\n  )\n• statusUpdatedAt: Date",
             "APPLICATION", color="#F0FDF4", edgecolor=EMERALD, fontsize=8)

    # 4. Interview
    draw_box(ax, 0.71, 0.06, 0.26, 0.34,
             "• _id: ObjectId (PK)\n• applicationId: ObjectId (FK -> Application, Unique)\n• startTime: Date\n• endTime: Date\n• interviewType: Enum (ONLINE, ONSITE)\n• meetingUrl: String\n• officeAddress: String\n• notes: String (Recruiter Evaluation)",
             "INTERVIEW", color="#FEF3C7", edgecolor=AMBER, fontsize=8)

    # 5. PasswordResetToken
    draw_box(ax, 0.03, 0.10, 0.28, 0.26,
             "• _id: ObjectId (PK)\n• userId: ObjectId (FK -> User, Unique)\n• tokenHash: String\n• expiresAt: Date (TTL Index)\n• usedAt: Date",
             "PASSWORD_RESET_TOKEN", color="#F8FAFC", edgecolor=SLATE_MID, fontsize=8.5)

    # 6. EmailLog
    draw_box(ax, 0.38, 0.10, 0.28, 0.26,
             "• _id: ObjectId (PK)\n• senderId: ObjectId (FK -> User)\n• applicationId: ObjectId (FK -> Application)\n• emailType: Enum\n• recipientEmail: String\n• subject: String, body: String\n• status: Enum (SENT, FAILED)\n• sentAt: Date, errorMessage: String",
             "EMAIL_LOG", color="#F8FAFC", edgecolor=SLATE_MID, fontsize=8)

    # Relationship lines & labels
    draw_arrow(ax, 0.31, 0.69, 0.38, 0.69, "1 : N (recruiterId)", color=TEAL_DARK, lw=2)
    draw_arrow(ax, 0.66, 0.69, 0.71, 0.69, "1 : N (jobId)", color=BLUE, lw=2)
    draw_arrow(ax, 0.20, 0.92, 0.80, 0.92, "1 : N (candidateId)", color=TEAL_DARK, lw=1.5)
    draw_arrow(ax, 0.84, 0.46, 0.84, 0.40, "1 : 1 (applicationId)", color=EMERALD, lw=2)
    draw_arrow(ax, 0.17, 0.46, 0.17, 0.36, "1 : 1 (userId)", color=SLATE_MID, lw=1.5)
    draw_arrow(ax, 0.71, 0.23, 0.66, 0.23, "1 : N", color=SLATE_MID, lw=1.5)

    plt.tight_layout()
    fig.savefig(os.path.join(output_dir, "erd_diagram.png"), bbox_inches='tight')
    plt.close(fig)
    print("Created erd_diagram.png")

# -------------------------------------------------------------
# 4. CANDIDATE WORKFLOW DIAGRAM
# -------------------------------------------------------------
def create_candidate_workflow_diagram():
    fig, ax = plt.subplots(figsize=(11, 7.5), dpi=300)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.96, "QUY TRÌNH ỨNG TUYỂN VÀ THEO DÕI CỦA ỨNG VIÊN (CANDIDATE WORKFLOW)", ha='center', va='center', fontsize=12, fontweight='bold', color=SLATE_DARK)

    steps = [
        (0.05, 0.78, 0.24, 0.12, "1. Tìm việc (Browse Jobs)\nLọc lương, ngành nghề, hình thức"),
        (0.38, 0.78, 0.24, 0.12, "2. Xem chi tiết việc làm\nKiểm tra mô tả & hạn nộp"),
        (0.71, 0.78, 0.24, 0.12, "3. Nộp hồ sơ ứng tuyển\nNhập thông tin & Upload CV file"),
        (0.71, 0.48, 0.24, 0.12, "4. Lưu trữ CV an toàn\nCloudinary Raw Storage & MongoDB"),
        (0.38, 0.48, 0.24, 0.12, "5. Theo dõi hồ sơ\nXem danh sách My Applications"),
        (0.05, 0.48, 0.24, 0.12, "6. Xem chi tiết đơn\nXem file CV & tình trạng xử lý"),
        (0.05, 0.18, 0.24, 0.12, "7. Xem lịch phỏng vấn\nNgày giờ, Online link / Địa chỉ"),
        (0.38, 0.18, 0.24, 0.12, "8. Tham gia phỏng vấn\nTheo đúng lịch đã thông báo"),
        (0.71, 0.18, 0.24, 0.12, "9. Nhận kết quả cuối cùng\nAccepted / Offer hoặc Rejected"),
    ]

    for x, y, w, h, text in steps:
        draw_box(ax, x, y, w, h, text, color=TEAL_LIGHT, edgecolor=TEAL_DARK, fontsize=8.5)

    draw_arrow(ax, 0.29, 0.84, 0.38, 0.84, "Chọn việc")
    draw_arrow(ax, 0.62, 0.84, 0.71, 0.84, "Bấm Apply")
    draw_arrow(ax, 0.83, 0.78, 0.83, 0.60, "Upload")
    draw_arrow(ax, 0.71, 0.54, 0.62, 0.54, "Thành công")
    draw_arrow(ax, 0.38, 0.54, 0.29, 0.54, "Xem chi tiết")
    draw_arrow(ax, 0.17, 0.48, 0.17, 0.30, "Được lên lịch")
    draw_arrow(ax, 0.29, 0.24, 0.38, 0.24, "Đến hẹn")
    draw_arrow(ax, 0.62, 0.24, 0.71, 0.24, "Kết quả")

    plt.tight_layout()
    fig.savefig(os.path.join(output_dir, "candidate_workflow_diagram.png"), bbox_inches='tight')
    plt.close(fig)
    print("Created candidate_workflow_diagram.png")

# -------------------------------------------------------------
# 5. RECRUITER WORKFLOW DIAGRAM
# -------------------------------------------------------------
def create_recruiter_workflow_diagram():
    fig, ax = plt.subplots(figsize=(13, 8), dpi=300)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.96, "QUY TRÌNH TUYỂN DỤNG & SÀNG LỌC CỦA NHÀ TUYỂN DỤNG (RECRUITER WORKFLOW)", ha='center', va='center', fontsize=12, fontweight='bold', color=SLATE_DARK)

    boxes = [
        (0.03, 0.65, 0.28, 0.22, "1. ĐĂNG TIN TUYỂN DỤNG\n• Tạo tin mới (Form validation)\n• Bản nháp (Draft) hoặc Xuất bản\n• Tin hết hạn -> Scheduler tự đóng", "QUẢN LÝ VIỆC LÀM", "#F0FDFA", TEAL_DARK),
        (0.36, 0.65, 0.28, 0.22, "2. SÀNG LỌC HỒ SƠ CV\n• Xem ứng viên tab PENDING\n• Xem trước CV PDF nhúng\n• Quyết định: Accept CV hoặc Reject CV", "STAGE 1: CV SCREENING", "#EFF6FF", BLUE),
        (0.69, 0.65, 0.28, 0.22, "3. LÊN LỊCH PHỎNG VẤN\n• Chọn ứng viên tab PASSED CV\n• Lên lịch đơn hoặc hàng loạt (Bulk)\n• Đặt ngày giờ, Online/Onsite URL/địa chỉ", "STAGE 2: SCHEDULING", "#FEF3C7", AMBER),
        (0.69, 0.15, 0.28, 0.24, "4. ĐÁNH GIÁ PHỎNG VẤN\n• Ứng viên ở tab WAITING INTERVIEW\n• Mở trang Evaluation 2 cột\n• Xem CV + Lịch hẹn song song\n• Nhập Notes & Lưu (Chuyển INTERVIEWED)", "STAGE 3: EVALUATION", "#FDF2F8", "#DB2777"),
        (0.36, 0.15, 0.28, 0.24, "5. QUYẾT ĐỊNH TUYỂN DỤNG\n• Xem ứng viên tab WAITING RESULT\n• Xem lại nhận xét phỏng vấn\n• Quyết định: Accept Offer hoặc Reject", "STAGE 4: HIRING DECISION", "#F0FDF4", EMERALD),
        (0.03, 0.15, 0.28, 0.24, "6. DANH SÁCH TRÚNG TUYỂN\n• Ứng viên ở tab PASSED (Đã nhận offer)\n• Lưu trữ hồ sơ ứng viên thành công\n• Xem lại toàn bộ tiến trình tuyển dụng", "STAGE 5: PASSED POOL", "#F8FAFC", SLATE_MID),
    ]

    for x, y, w, h, text, title, color, edgecolor in boxes:
        draw_box(ax, x, y, w, h, text, title=title, color=color, edgecolor=edgecolor, fontsize=8.5, title_fontsize=9.5)

    draw_arrow(ax, 0.31, 0.76, 0.36, 0.76, "Có ứng tuyển", color=TEAL_DARK, lw=2)
    draw_arrow(ax, 0.64, 0.76, 0.69, 0.76, "Accept CV", color=BLUE, lw=2)
    draw_arrow(ax, 0.83, 0.65, 0.83, 0.39, "Bulk Schedule", color=AMBER, lw=2)
    draw_arrow(ax, 0.69, 0.27, 0.64, 0.27, "Save Notes", color="#DB2777", lw=2)
    draw_arrow(ax, 0.36, 0.27, 0.31, 0.27, "Accept Offer", color=EMERALD, lw=2)

    plt.tight_layout()
    fig.savefig(os.path.join(output_dir, "recruiter_workflow_diagram.png"), bbox_inches='tight')
    plt.close(fig)
    print("Created recruiter_workflow_diagram.png")

# -------------------------------------------------------------
# 6. AUTHENTICATION & AUTHORIZATION FLOW DIAGRAM
# -------------------------------------------------------------
def create_auth_flow_diagram():
    fig, ax = plt.subplots(figsize=(12, 8), dpi=300)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.96, "LUỒNG XÁC THỰC VÀ PHÂN QUYỀN (JWT COOKIE AUTHENTICATION & RBAC)", ha='center', va='center', fontsize=12, fontweight='bold', color=SLATE_DARK)

    steps = [
        (0.04, 0.62, 0.20, 0.26, "CLIENT (BROWSER)\n\n1. Người dùng nhập\nEmail & Mật khẩu\n2. Gửi POST /api/auth/login\n(withCredentials: true)", "BƯỚC 1: CLIENT", "#EFF6FF", BLUE),
        (0.28, 0.62, 0.20, 0.26, "API GATEWAY & VALIDATOR\n\n1. Kiểm tra format Email & PW\n2. Chặn Request nếu invalid\n3. Chuyển vào Controller", "BƯỚC 2: VALIDATE", "#F8FAFC", SLATE_MID),
        (0.52, 0.62, 0.20, 0.26, "AUTH SERVICE & DATABASE\n\n1. Tìm User theo Email\n2. So sánh bcrypt.compare()\n3. Kiểm tra user.isActive\n(Nếu false -> 401 chặn)", "BƯỚC 3: XÁC THỰC", "#F0FDFA", TEAL_DARK),
        (0.76, 0.62, 0.20, 0.26, "JWT GENERATION & COOKIE\n\n1. Ký JWT { id, role }\n2. Set HTTP-only Cookie\n(SameSite, Secure, 1d)\n3. Trả về Profile JSON", "BƯỚC 4: CẤP TOKEN", "#F0FDF4", EMERALD),
        (0.76, 0.12, 0.20, 0.32, "REQUEST KÈM COOKIE\n\n1. Các request sau tự động\ngửi kèm Cookie Token\n2. Auth Middleware chặn lại", "BƯỚC 5: GỌI API", "#EFF6FF", BLUE),
        (0.52, 0.12, 0.20, 0.32, "AUTH PROTECT CHECK\n\n1. Verify JWT signature\n2. Query DB: User.findById()\n3. Kiểm tra user.isActive\n4. Gán req.user = { id, role }", "BƯỚC 6: CHECK AUTH", "#FEF3C7", AMBER),
        (0.28, 0.12, 0.20, 0.32, "ROLE-BASED AUTHORIZE\n\n1. Check allowedRoles:\n(CANDIDATE, RECRUITER, ADMIN)\n2. Nếu không khớp -> 403\n3. Nếu đúng quyền -> next()", "BƯỚC 7: PHÂN QUYỀN", "#FDF2F8", "#DB2777"),
        (0.04, 0.12, 0.20, 0.32, "THỰC THI NGHIỆP VỤ\n\n1. Controller thực hiện logic\n2. Trả kết quả JSON về Client\n3. Frontend hiển thị Toast/UI", "BƯỚC 8: KẾT QUẢ", "#F0FDFA", TEAL_DARK),
    ]

    for x, y, w, h, text, title, color, edgecolor in steps:
        draw_box(ax, x, y, w, h, text, title=title, color=color, edgecolor=edgecolor, fontsize=8, title_fontsize=9)

    draw_arrow(ax, 0.24, 0.75, 0.28, 0.75, "Credentials")
    draw_arrow(ax, 0.48, 0.75, 0.52, 0.75, "Valid")
    draw_arrow(ax, 0.72, 0.75, 0.76, 0.75, "Success")
    draw_arrow(ax, 0.86, 0.62, 0.86, 0.44, "Auto Cookie")
    draw_arrow(ax, 0.76, 0.28, 0.72, 0.28, "Verify")
    draw_arrow(ax, 0.52, 0.28, 0.48, 0.28, "Valid")
    draw_arrow(ax, 0.28, 0.28, 0.24, 0.28, "Authorized")

    plt.tight_layout()
    fig.savefig(os.path.join(output_dir, "auth_flow_diagram.png"), bbox_inches='tight')
    plt.close(fig)
    print("Created auth_flow_diagram.png")

if __name__ == "__main__":
    create_use_case_diagram()
    create_system_architecture_diagram()
    create_erd_diagram()
    create_candidate_workflow_diagram()
    create_recruiter_workflow_diagram()
    create_auth_flow_diagram()
    print("All 6 diagrams generated successfully!")
