// Load initial ads
    (adsbygoogle = window.adsbygoogle || []).push({});
    (adsbygoogle = window.adsbygoogle || []).push({});
    (adsbygoogle = window.adsbygoogle || []).push({});

    // Function to refresh an ad slot
    function refreshAd(adId, slotId, format = "auto", layout = "") {
      const adDiv = document.getElementById(adId);
      adDiv.innerHTML = `
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="ca-pub-3576699728102241"
             data-ad-slot="${slotId}"
             data-ad-format="${format}"
             data-ad-layout="${layout}"
             data-full-width-responsive="true"></ins>
      `;
      (adsbygoogle = window.adsbygoogle || []).push({});
    }

    // Refresh all ads every 60 seconds
    setInterval(() => {
      refreshAd("kendrick Ads", "4926512368");
      refreshAd("footer Ads", "2550806675");
      refreshAd("content-ad", "3333333333", "fluid", "in-article");
    }, 60000);