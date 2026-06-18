const POLL_INTERVAL = 3000;

async function updateBlockingRules(data) {
  const { isFocusing, blacklist } = data;
  
  // Get current rules to check what's already applied
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const existingRuleIds = existingRules.map(r => r.id);
  
  if (!isFocusing || !blacklist || blacklist.length === 0) {
    if (existingRuleIds.length > 0) {
      await clearBlockingRules(existingRuleIds);
      await chrome.action.setBadgeText({ text: '' });
    }
    return;
  }
  
  // Create rules from blacklist
  const newRules = blacklist.map((domain, index) => {
    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '');
    return {
      id: index + 1,
      priority: 1,
      action: { type: 'block' },
      condition: { 
        urlFilter: `||${cleanDomain}`,
        resourceTypes: ['main_frame', 'sub_frame', 'script', 'xmlhttprequest', 'media']
      }
    };
  });
  
  const newRuleIds = newRules.map(r => r.id);
  
  // Only update if rules changed
  if (JSON.stringify(existingRuleIds.sort()) !== JSON.stringify(newRuleIds.sort())) {
    try {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRuleIds, // Clean up all old rules
        addRules: newRules
      });
      
      await chrome.action.setBadgeText({ text: 'ON' });
      await chrome.action.setBadgeBackgroundColor({ color: '#8B5CF6' }); // Aurora purple
    } catch (err) {
      console.error("Failed to update DNR rules", err);
    }
  }
}

async function clearBlockingRules(existingRuleIds = null) {
  try {
    const idsToRemove = existingRuleIds || (await chrome.declarativeNetRequest.getDynamicRules()).map(r => r.id);
    if (idsToRemove.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: idsToRemove
      });
    }
  } catch (err) {
    console.error("Failed to clear DNR rules", err);
  }
}

async function checkStatus() {
  try {
    // Quick timeout fetch to avoid hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch('http://127.0.0.1:43210/status', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      await updateBlockingRules(data);
    }
  } catch (err) {
    // Cannot reach Aurora desktop app (app closed)
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    if (existingRules.length > 0) {
      await clearBlockingRules(existingRules.map(r => r.id));
      await chrome.action.setBadgeText({ text: '' });
    }
  }
}

// Fast polling loop while active
async function pollLoop() {
  await checkStatus();
  setTimeout(pollLoop, POLL_INTERVAL);
}

// Start polling
pollLoop();

// Fallback alarm to wake SW up if it goes to sleep
chrome.alarms.create("keepAlive", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "keepAlive") {
    checkStatus();
  }
});

// Open welcome page on installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({ url: "https://cavalinho-xdd.web.app/extension-welcome" }); // Replace with actual production URL
  }
});
