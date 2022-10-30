function loadEvents() {
    _globalVars.elms.spin.click(function () {
      if (!_globalVars.isProcessing) {
        if (_dynamicParams.config.allowSound) {
          var spinSound = document.getElementById("spinSound");
          spinSound.play().catch(function () {});
        }
        spin(function (data) {
          console.log(data);
          {
            showPopup(data);
          }
        });
      }
    });
    document.addEventListener(
      "onRedeemCompleted",
      function (data) {
        console.log(data.rewardValue);
        console.log(data.rewardimageUrl);
      },
      false
    );

    var burgerMenu = document.querySelector(".burger-menu");
    burgerMenu.addEventListener("click", function (event) {
      burgerMenu.children[0].classList.toggle("active");
      burgerMenu.children[0].classList.toggle("cross");
      burgerMenu.children[1].classList.toggle("active");
      burgerMenu.children[1].classList.toggle("cross");
      burgerMenu.children[2].classList.toggle("hide");
    });

    if (document.querySelector(".affiliate-link") !== null) {
      document
        .querySelector(".affiliate-link, .popup-container")
        .addEventListener(
          "click",
          function (e) {
            if (
              e.target.className.indexOf("popup-container") > -1 ||
              e.target.className.indexOf("btn-continue") > -1 ||
              e.target.className === ""
            ) {
              redirectAffiliateLink();
            }
          },
          false
        );
    }

    if (document.querySelector("#access-key .btn-submit")) {
      setTimeout(function () {
        document
          .querySelector("#access-key .inner-content")
          .classList.add("active");
      }, 100);

      document.querySelector("#access-key .btn-submit").addEventListener(
        "click",
        function (e) {
          verifyAccess();
        },
        false
      );
    }
  }
  function showPopup(data) {
    if (document.querySelector(".affiliate-link")) {
      try {
        var imageUrl = "";
        for (var i = 0; i < _dynamicParams.jsonData.length; i++) {
          if (_dynamicParams.jsonData[i].value == data) {
            imageUrl = _dynamicParams.jsonData[i].imageUrl;
          }
        }

        if (data) {
          document.querySelector(
            "#number-coin-luckydraw strong"
          ).innerHTML = data;
          document.querySelector("#rewardImg").src = imageUrl;
        } else {
          document.querySelector(
            "#number-coin-luckydraw strong"
          ).innerHTML = totalPrice + "$";
        }
      } catch (ex) {}

      var rewardSound = document.getElementById("rewardSound");
      rewardSound.play().catch(function () {});
      document.querySelector("#daily-lucky").classList.remove("hide");
    }
  }
  let spin_btn = document.getElementById("spin_btn");
  spin_btn.onclick = function () {
    document
      .querySelector('g[style="cursor: pointer;"]')
      .dispatchEvent(new Event("click"));
  };