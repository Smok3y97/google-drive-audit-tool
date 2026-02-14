# 📊 Google Drive Sharing Audit Tool

This Google Apps Script performs a **comprehensive security audit** of your Google Drive account. It identifies all files and folders that are not strictly private and exports the findings into an organized Google Spreadsheet.

## ✨ Development Note
This project was developed using **Vibe Coding** with the assistance of **Google Gemini** to create a practical solution for Drive security.

## 🚀 Features
* **Full Inventory:** Lists every file and folder that is not strictly private.
* **Risk Identification:** Detects public links, specific user access, and domain-wide shares.
* **Hierarchy Preservation:** Maintains the folder structure in the export sheet.
* **Automated Export:** Generates a Google Spreadsheet with all findings and a timestamp.

---

## 🛠 Setup Instructions (Step-by-Step)

### 1. Prerequisites (IMPORTANT!)
To allow the script to scan permissions, you must enable the **Drive API**:
1. Open [Google Apps Script](https://script.google.com/).
2. Create a new project.
3. In the left sidebar, click the **+** icon next to **Services**.
4. Select **Drive API** (Version v3) and click **Add**.

### 2. Installation
1. Copy the code from the `audit_script.gs` file in this repository.
2. Replace any existing code in the Apps Script editor with this script.
3. Save the project (💾).

### 3. Execution
1. Select the function `generateFullSharingReport`.
2. Click **▷ Run**.
3. **Permissions:** Review and accept the security prompts to allow the script to access your Drive.

---

## 📑 Interpreting the Results
The tool uses a priority logic to display the most "open" sharing status:

| Status Label | Meaning |
| :--- | :--- |
| **⚠️ Public on the Web** | Indexed and searchable by search engines. |
| **⚠️ Anyone with Link** | Accessible to anyone who has the URL. |
| **🏢 Domain / Company** | Shared with everyone in your organization. |
| **🔒 Restricted** | Access is limited to specific invited users only. |

### 📊 Example Output
The script generates a tree-like structure to visualize your folder hierarchy:

| File Name (Structure) | Type | Sharing Status | Authorized Persons |
| :--- | :--- | :--- | :--- |
| **📁 Project Alpha** | Folder | **⚠️ Anyone with Link** | *extern@gmail.com* |
| &nbsp;&nbsp;&nbsp;└─ **📁 Confidential** | Folder | **🔒 Restricted (People)** | *manager@company.com* |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─ 📄 Strategy.pdf | File | **🔒 Restricted (People)** | *manager@company.com* |
| &nbsp;&nbsp;&nbsp;└─ 📄 Presentation.slides | File | **⚠️ Public on the Web** | |

---

## 📜 License
This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

## 🔗 Credits
* Developed via Vibe Coding with **Google Gemini**.
* Based on the original documentation in [Smok3y's Wiki](https://wiki.smok3y.de/books/good-to-know/page/google-drive-vollstandiges-audit-aller-freigaben).