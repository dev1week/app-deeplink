(function () {
  var IOS_APP_STORE_URL =
    "https://apps.apple.com/kr/app/%EB%84%A4%EC%9D%B4%EB%B2%84-naver/id393499958";
  var ANDROID_STORE_URL =
    "https://play.google.com/store/apps/details?id=com.nhn.android.search&hl=ko";
  var IOS_SCHEME_URL = "naversearchapp://default?version=1";
  var ANDROID_INTENT_URL =
    "intent://default?version=5#Intent;scheme=naversearchapp;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.nhn.android.search;end;";
  var WEB_RELAY_URL = "https://naverapp.naver.com/default/?version=5";

  var statusText = document.getElementById("statusText");
  var openNowBtn = document.getElementById("openNowBtn");
  var installBtn = document.getElementById("installBtn");

  var ua = navigator.userAgent || "";
  var isAndroid = /Android/i.test(ua);
  var isIOS = /iPhone|iPad|iPod/i.test(ua);
  var pageHidden = false;
  var openTimer = null;
  var fallbackTimer = null;

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
    setStatus("1초 후 자동으로 앱이 열립니다.");
    openTimer = setTimeout(openNaverApp, 1000);
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
