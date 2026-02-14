/**
 * SCRIPT: Audit of all Google Drive shares (People & Links)
 * VERSION: 4.1 (Full Audit & Email-List)
 * PURPOSE:
 * Lists EVERY file that is not strictly private.
 * Shows sharing status and specific email addresses.
 *
 * PREREQUISITE:
 * "Drive API" service (Version 3) must be enabled in the Apps Script project.
 */

function generateFullSharingReport() {
  
  // --- 1. SETUP ---
  // Creates the target spreadsheet with a current timestamp
  var timestamp = new Date().toLocaleString();
  var spreadsheet = SpreadsheetApp.create("Security Report: All Shares (" + timestamp + ")");
  var sheet = spreadsheet.getActiveSheet();
  
  Logger.log("Starting full scan...");

  // --- 2. DATA COLLECTION ---
  var allItemsMap = {}; 
  var rootItems = []; 
  
  var pageToken;
  var count = 0;
  
  do {
    // API v3 Query: Fetches ID, Name, Link, Parents, and detailed permissions
    var result = Drive.Files.list({
      q: "'me' in owners and trashed = false", 
      pageSize: 1000, 
      pageToken: pageToken,
      fields: "nextPageToken, files(id, name, mimeType, webViewLink, parents, permissions(type, role, emailAddress, allowFileDiscovery))" 
    });

    var files = result.files;
    
    if (files && files.length > 0) {
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        
        // Analyze permissions
        var analysis = analyzePermissions(file.permissions);
        
        // If the file is NOT private (i.e., has any kind of share), we include it
        if (analysis.isShared) {
          file.children = []; 
          file.analysis = analysis; 
          allItemsMap[file.id] = file;
          count++;
        }
      }
    }
    pageToken = result.nextPageToken; 
  } while (pageToken);

  Logger.log(count + " shared items found. Building structure...");

  // --- 3. BUILD HIERARCHY STRUCTURE ---
  // Assigns files to their parent folders to create a tree structure
  for (var id in allItemsMap) {
    var item = allItemsMap[id];
    var parentId = (item.parents && item.parents.length > 0) ? item.parents[0] : null;
    
    if (parentId && allItemsMap[parentId]) {
      allItemsMap[parentId].children.push(item);
    } else {
      rootItems.push(item);
    }
  }

  // --- 4. GENERATE OUTPUT (Recursive) ---
  var outputRows = [];
  outputRows.push(["File Name (Structure)", "Type", "Link", "Sharing Status", "Authorized Persons"]); 

  function processNode(node, depth) {
    // Calculate indentation for tree view
    var indent = "";
    for (var k=0; k<depth; k++) indent += "   "; 
    var visualName = indent + (depth > 0 ? "└─ " : "") + node.name;
    
    var typeLabel = (node.mimeType === 'application/vnd.google-apps.folder') ? "Folder" : "File";
    
    var status = node.analysis.statusLabel;
    var users = node.analysis.userList;

    outputRows.push([visualName, typeLabel, node.webViewLink, status, users]);

    // Sort children (folders first, then alphabetically)
    if (node.children.length > 0) {
      node.children.sort(function(a, b) {
        var aIsFolder = (a.mimeType === 'application/vnd.google-apps.folder');
        var bIsFolder = (b.mimeType === 'application/vnd.google-apps.folder');
        if (aIsFolder && !bIsFolder) return -1;
        if (!aIsFolder && bIsFolder) return 1;
        return a.name.localeCompare(b.name);
      });

      for (var j=0; j<node.children.length; j++) {
        processNode(node.children[j], depth + 1);
      }
    }
  }

  // Sort root elements and start process
  rootItems.sort(function(a, b) {
     var aIsFolder = (a.mimeType === 'application/vnd.google-apps.folder');
     var bIsFolder = (b.mimeType === 'application/vnd.google-apps.folder');
     if (aIsFolder && !bIsFolder) return -1;
     if (!aIsFolder && bIsFolder) return 1;
     return a.name.localeCompare(b.name);
  });

  for (var i=0; i<rootItems.length; i++) {
    processNode(rootItems[i], 0);
  }

  // --- 5. WRITE TO SPREADSHEET ---
  if (outputRows.length > 1) {
    sheet.getRange(1, 1, outputRows.length, 5).setValues(outputRows);
    sheet.getRange("A1:E1").setFontWeight("bold");
    sheet.setFrozenRows(1); // Freezes the header row
    sheet.setColumnWidth(1, 400); // Widens the name column
    sheet.setColumnWidth(5, 300); // Widens the email column
  }

  Logger.log("Finished! Report: " + spreadsheet.getUrl());
}

/**
 * HELPER FUNCTION: Analyzes file permissions
 * Prioritizes public links over individual shares
 */
function analyzePermissions(perms) {
  var isShared = false;
  var statusLabel = "Private";
  var userEmails = [];

  if (perms) {
    for (var i = 0; i < perms.length; i++) {
      var p = perms[i];
      if (p.role === 'owner') continue; // Ignore owner
      
      isShared = true; 

      // Status label prioritization (Warning for public links)
      if (p.type === 'anyone') {
        statusLabel = p.allowFileDiscovery ? "⚠️ Public on the Web" : "⚠️ Anyone with Link";
      } else if (p.type === 'domain' && !statusLabel.includes("⚠️")) {
        statusLabel = "🏢 Domain / Company";
      } else if ((p.type === 'user' || p.type === 'group')) {
        var email = p.emailAddress || "Group/Unknown";
        userEmails.push(email);
      }
    }
  }

  // Fallback: If status still seems "Private" but users are assigned
  if (statusLabel === "Private" && userEmails.length > 0) {
    statusLabel = "🔒 Restricted (People)";
  }

  return {
    isShared: isShared,
    statusLabel: statusLabel,
    userList: userEmails.join(", ")
  };
}