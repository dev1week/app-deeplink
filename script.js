(function () {
  var IOS_APP_STORE_URL =
    "https://apps.apple.com/kr/app/%EB%84%A4%EC%9D%B4%EB%B2%84-naver/id393499958";
  var ANDROID_STORE_URL =
    "https://play.google.com/store/apps/details?id=com.nhn.android.search&hl=ko";
  var IOS_SCHEME_URL = "naversearchapp://search?qmenu=music&version=1";
  var ANDROID_INTENT_URL =
    "intent://search?qmenu=music&version=1#Intent;scheme=naversearchapp;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.nhn.android.search;end;";
  var WEB_RELAY_URL =
    "https://naverapp.naver.com/search/?qmenu=music&version=1";

  var statusText = document.getElementById("statusText");
  var openNowBtn = document.getElementById("openNowBtn");
  var installBtn = document.getElementById("installBtn");

  function detectPlatform() {
    var ua = navigator.userAgent || "";
    var platform = (navigator.platform || "").toLowerCase();
    var uaDataPlatform =
      navigator.userAgentData &&
      typeof navigator.userAgentData.platform === "string"
        ? navigator.userAgentData.platform.toLowerCase()
        : "";
    var maxTouchPoints = navigator.maxTouchPoints || 0;

    var hasAndroidInUA = /android/i.test(ua);
    var hasIOSInUA = /iphone|ipad|ipod/i.test(ua);
    var hasIOSInPlatform = /iphone|ipad|ipod/.test(platform);
    var hasAndroidInUAData = uaDataPlatform === "android";
    var hasIOSInUAData = uaDataPlatform === "ios";

    // iPadOS 13+ can report itself as MacIntel in Safari.
    var isIPadOSDesktopMode = platform === "macintel" && maxTouchPoints > 1;

    var isIOS =
      hasIOSInUA || hasIOSInPlatform || hasIOSInUAData || isIPadOSDesktopMode;
    var isAndroid = (hasAndroidInUA || hasAndroidInUAData) && !isIOS;

    return {
      isAndroid: isAndroid,
      isIOS: isIOS,
    };
  }

  var platformInfo = detectPlatform();
  var isAndroid = platformInfo.isAndroid;
  var isIOS = platformInfo.isIOS;
  var autoOpenDelayMs = getAutoOpenDelayMs();
  var pageHidden = false;
  var openTimer = null;
  var fallbackTimer = null;

  function getAutoOpenDelayMs() {
    var DEFAULT_DELAY_MS = 1000;
    var MAX_DELAY_MS = 60000;
    var rawDelay = new URLSearchParams(window.location.search).get("delay");

    if (rawDelay === null || rawDelay.trim() === "") {
      return DEFAULT_DELAY_MS;
    }

    var parsedDelay = Number(rawDelay);
    if (!Number.isFinite(parsedDelay)) {
      return DEFAULT_DELAY_MS;
    }

    var normalizedDelay = Math.max(0, Math.floor(parsedDelay));
    return Math.min(normalizedDelay, MAX_DELAY_MS);
  }

  function getStoreUrl() {
    if (isIOS) return IOS_APP_STORE_URL;
    if (isAndroid) return ANDROID_STORE_URL;
    return "https://www.naver.com/";
  }

  function getDeepLinkUrl() {
    if (isAndroid) return ANDROID_INTENT_URL;
    if (isIOS) return IOS_SCHEME_URL;
    return WEB_RELAY_URL;
  }

  function setStatus(message) {
    if (!statusText) return;
    statusText.textContent = message;
  }

  function clearTimers() {
    if (openTimer) clearTimeout(openTimer);
    if (fallbackTimer) clearTimeout(fallbackTimer);
  }

  function goToStore() {
    window.location.href = getStoreUrl();
  }

  function openNaverApp() {
    clearTimers();
    setStatus("네이버 앱을 열고 있습니다...");

    var startedAt = Date.now();
    window.location.href = getDeepLinkUrl();

    // 앱 전환이 실패한 경우에만 스토어로 이동한다.
    fallbackTimer = setTimeout(function () {
      var elapsed = Date.now() - startedAt;
      if (!pageHidden && elapsed < 3200) {
        setStatus("앱이 설치되어 있지 않아 설치 페이지로 이동합니다.");
        goToStore();
      }
    }, 1700);
  }

  function initAutoOpen() {
    if (autoOpenDelayMs === 0) {
      setStatus("Opening the app now...");
      openNaverApp();
      return;
    }

    setStatus("Opening the app in " + autoOpenDelayMs + "ms...");
    openTimer = setTimeout(openNaverApp, autoOpenDelayMs);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) pageHidden = true;
  });

  window.addEventListener("pagehide", function () {
    pageHidden = true;
  });

  if (openNowBtn) {
    openNowBtn.addEventListener("click", openNaverApp);
  }

  if (installBtn) {
    installBtn.addEventListener("click", function () {
      clearTimers();
      goToStore();
    });
  }

  initAutoOpen();
})();
