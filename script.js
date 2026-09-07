(function () {
  var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function fmtTime(mins) {
    var h = Math.floor(mins / 60) % 24, m = mins % 60;
    var period = h < 12 ? 'AM' : 'PM';
    var h12 = h % 12;
    if (h12 === 0) h12 = 12;
    return h12 + ':' + pad(m) + ' ' + period;
  }

  function activityText(row) {
    if (!row) return null;
    var el = row.querySelector('.activity');
    return el ? el.textContent.trim() : null;
  }

  var lastRow = null;
  var dayCards = document.querySelectorAll('.day-card');

  function render() {
    var now = new Date();
    var dow = now.getDay();
    var nowMin = now.getHours() * 60 + now.getMinutes();

    var currentCard = null;
    dayCards.forEach(function (card) {
      var isToday = parseInt(card.dataset.day, 10) === dow;
      card.classList.toggle('is-today', isToday);
      if (isToday) currentCard = card;
    });

    if (lastRow) {
      lastRow.classList.remove('now');
      lastRow = null;
    }

    var currentRow = null, nextRow = null;
    if (currentCard) {
      var rows = Array.prototype.slice.call(currentCard.querySelectorAll('.row'));
      rows.forEach(function (row) {
        var s = parseInt(row.dataset.start, 10);
        var e = parseInt(row.dataset.end, 10);
        if (nowMin >= s && nowMin < e) currentRow = row;
      });
      if (!currentRow) {
        var minDiff = Infinity;
        rows.forEach(function (row) {
          var s = parseInt(row.dataset.start, 10);
          var diff = s - nowMin;
          if (diff >= 0 && diff < minDiff) {
            minDiff = diff;
            currentRow = row;
          }
        });
        if (!currentRow && rows.length) currentRow = rows[rows.length - 1];
      }
      if (currentRow) {
        currentRow.classList.add('now');
        lastRow = currentRow;
        var idx = rows.indexOf(currentRow);
        nextRow = rows[idx + 1] || null;
      }
    }

    var banner = document.getElementById('now-banner');
    if (banner) {
      banner.querySelector('.banner-day').textContent = dayNames[dow] + ' · ' + fmtTime(nowMin);
      banner.querySelector('.banner-activity').textContent = activityText(currentRow) || 'Free time';
      var nextText = activityText(nextRow);
      var nextEl = banner.querySelector('.banner-next');
      if (nextText) {
        nextEl.textContent = 'Next: ' + nextText;
        nextEl.hidden = false;
      } else {
        nextEl.hidden = true;
      }
    }

    return currentRow || currentCard;
  }

  var initialTarget = render();

  window.addEventListener('load', function () {
    if (initialTarget) {
      initialTarget.scrollIntoView({ block: initialTarget.classList.contains('row') ? 'center' : 'start', behavior: 'auto' });
    }
  });

  var banner = document.getElementById('now-banner');
  if (banner) {
    banner.addEventListener('click', function () {
      var target = lastRow || document.querySelector('.day-card.is-today');
      if (target) target.scrollIntoView({ block: target.classList.contains('row') ? 'center' : 'start', behavior: 'smooth' });
    });
  }

  // Keep "now" and the banner accurate if the app is left open across a time boundary.
  setInterval(render, 30000);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
