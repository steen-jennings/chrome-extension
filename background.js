console.log("Extension loaded");
let loggedInTabId = null;
let user_signed_in = false;
//TODO:GMAIL Use a build tool (e.g., webpack) to inject environment variables during the build process

//TODO:Chrome - I feel like we might not need to have this logic if the side-panel script just executes the toggle on click
// Background script or popup script
chrome.action.onClicked.addListener(tab => {
  console.log('action.onClicked - tab: ', tab);
  chrome.tabs.sendMessage(tab.id,"toggle");
  if (tab.url === 'chrome://newtab/') {
    console.log('on clicked on a new tab');
    // Open your custom page in a new tab
    chrome.tabs.create({ url: 'temp-frame.html' }, (newTab) => {
      console.log('newTab: ', newTab);
      console.log('tabUrl from new tab: ', newTab.url);
      chrome.storage.local.get('sidePanelTabId', function(data) {
        const sidePanelTabId = data.sidePanelTabId;
        console.log('sidePanelTabId: ', sidePanelTabId);
        
        // Send the toggle message to the fetched tab ID
        chrome.tabs.sendMessage(newTab.id, "toggleNewTab", function(response) {
          if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError);
          } else {
            console.log('Toggle message sent to tab ID:', sidePanelTabId);
          }
        });
      });
    });
  }
  console.log('message sent');
});

let iFramePopUpId;
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('request.action: ', request.action);
  if (request.action === "getTabId") {
    const tabId = sender.tab.id;
    iFramePopUpId = sender.tab.id;
    sendResponse({ tabId: tabId });
  }
  if (request.action === "getSidePanelTabId") {
    const tabId = sender.tab.id;
    chrome.storage.local.set({ sidePanelTabId: tabId });
    sendResponse({ tabId: tabId });
  }
  //TODO:CHROME - have a new listener here that checks tab url and opens the side panel maybe?
  if (request.action === "openEMTWindow") {
    console.log('getting the message?');
    // Fetch the sidePanelTabId from Chrome storage
    chrome.storage.local.get('sidePanelTabId', function(data) {
      const sidePanelTabId = data.sidePanelTabId;
      console.log('sidePanelTabId: ', sidePanelTabId);
      
      // Send the toggle message to the fetched tab ID
      chrome.tabs.sendMessage(sidePanelTabId, "closeSidePanel", function(response) {
        if (chrome.runtime.lastError) {
          console.error('Error sending message:', chrome.runtime.lastError);
        } else {
          console.log('Toggle message sent to tab ID:', sidePanelTabId);
        }
      });
    });
    // Trigger the desired action, in this case, openNewCloseableWindow
    reloadCloseableWindow();
  }
});

// Function to create the closeable window
const openNewCloseableWindow = () => {
  // const windowOptions = 'width=400,height=300,menubar=no,location=no,resizable=yes,scrollbars=no,status=no';
  const windowUrl = chrome.runtime.getURL("embedded-meeting-times-frame.html"); // Replace 'your-iframe-page.html' with your iframe page URL
  console.log('windowUrl:', windowUrl);
  // const screenWidth = screen.availWidth;
  // const screenHeight = screen.availHeight;
  const windowWidth = 1135; // Adjust this to your desired window width
  const windowHeight = 780; // Adjust this to your desired window height

  // const leftPosition = (screenWidth - windowWidth) / 2;
  // const topPosition = (screenHeight - windowHeight) / 2;

  const windowOptions = {
    url: windowUrl,
    type: 'popup',
    width: windowWidth, // Set the width and height as needed
    height: windowHeight,
    // left: leftPosition, // Use the calculated left position
    // top: topPosition, // Use the calculated top position
  };

  chrome.windows.create(windowOptions, (window) => {
    // Window has been created
    console.log('New window created with ID:', window.id);
    chrome.tabs.sendMessage(iFramePopUpId, { message: 'communicateWithFrame' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message:', chrome.runtime.lastError);
      } else {
        console.log('Message sent to content script:', response);
      }
    });
  });
};

// Function to check if the closeable window is still open and reload it
const reloadCloseableWindow = () => {
  chrome.windows.getAll({ populate: true }, (windows) => {
    let closeableTab;

    for (const window of windows) {
      if (window.tabs.some(tab => tab.url === chrome.runtime.getURL("embedded-meeting-times-frame.html"))) {
        // If the closeable window is found among open windows, store the tab for reloading
        closeableTab = window.tabs.find(tab => tab.url === chrome.runtime.getURL("embedded-meeting-times-frame.html"));
        break;
      }
    }

    if (closeableTab) {
      // Check if the window is minimized
      if (closeableTab.windowId !== chrome.windows.WINDOW_ID_NONE) {
        chrome.windows.update(closeableTab.windowId, { focused: true }, () => {
          chrome.tabs.reload(closeableTab.id, () => {
            console.log('closeable window found, reloaded, and brought to the foreground');
          });
        });
      } else {
        // If the window is not minimized, just reload the tab
        chrome.tabs.reload(closeableTab.id, () => {
          console.log('closeable window found and reloaded');
          //here
          chrome.tabs.sendMessage(iFramePopUpId, { message: 'communicateWithFrame' }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error sending message:', chrome.runtime.lastError);
            } else {
              console.log('Message sent to content script:', response);
            }
          });
        });
      }
      } else {
      // If the closeable window is not found among open windows, create a new one
      openNewCloseableWindow();
    }
  });
};


// // Listen for the extension being installed or updated
// chrome.runtime.onInstalled.addListener(function() {
//   console.log('in the new shit')
//   // Check if the extension was launched with an empty domain (e.g., "chrome://extensions/")
//   chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
//     console.log('tabs: ', tabs);
//     if (tabs[0].url === 'chrome://newtab/') {
//       console.log('tabs: ', tabs[0]);
//       // Replace 'your-extension-page.html' with the actual HTML page of your extension
//       const extensionUrl = chrome.runtime.getURL('embedded-meeting-times-frame.html');

//       // Create a new tab with your extension's address
//       chrome.tabs.create({ url: extensionUrl });
//     }
//   });
// });