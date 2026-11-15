// About の第三者通知は固定メタデータから作り、外部URLは固定ID経由で開く。
let installed = false;

function addText(parent, tag, value, className) {
  const element = document.createElement(tag);
  element.textContent = String(value ?? '');
  if (className) element.className = className;
  parent.appendChild(element);
  return element;
}

function addReference(parent, id, label, status, errorText) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'about-reference-link';
  button.textContent = label;
  button.dataset.referenceId = id;
  button.addEventListener('click', async () => {
    status.textContent = '';
    try { await window.electronAPI.openLogoReference(id); }
    catch { status.textContent = errorText; }
  });
  parent.appendChild(button);
  return button;
}

function addDocument(parent, item) {
  const details = document.createElement('details');
  const summary = document.createElement('summary');
  summary.textContent = item.title || item.file;
  details.appendChild(summary);
  details.dataset.documentFile = item.file;
  // 数MBのライセンスHTML等をAbout初期表示時にDOMへ展開しない。
  details.addEventListener('toggle', () => {
    if (!details.open || details.dataset.loaded === 'true') return;
    const pre = document.createElement('pre');
    pre.textContent = item.text || '';
    details.appendChild(pre);
    details.dataset.loaded = 'true';
  });
  parent.appendChild(details);
}

function installLogoNotices() {
  if (installed) return;
  installed = true;
  window.electronAPI.getAboutInfo().then(info => {
    const container = document.getElementById('aboutThirdPartyNotices');
    const status = document.getElementById('aboutThirdPartyLinkStatus');
    const logoData = info.logoNotices || {};
    const iconData = info.moduleIconAttributions;
    const errorText = logoData.openError;
    document.getElementById('aboutThirdPartyTitle').textContent = logoData.thirdPartyHeading;

    if (logoData.disclaimer) addText(container, 'p', logoData.disclaimer);
    for (const entry of (logoData.entries || [])) {
      const paragraph = document.createElement('p');
      paragraph.appendChild(document.createTextNode(`${entry.text || ''} `));
      addReference(paragraph, entry.id, entry.wordMark || entry.id, status, errorText);
      container.appendChild(paragraph);
    }

    if (iconData) {
      addText(container, 'h4', iconData.heading);
      addText(container, 'p', iconData.attribution);
      const list = document.createElement('ul');
      for (const item of (iconData.items || [])) {
        const row = document.createElement('li');
        row.appendChild(document.createTextNode(`${item.id}: ${item.icon} — `));
        addReference(row, item.id, logoData.tablerSourceLabel, status, errorText);
        list.appendChild(row);
      }
      container.appendChild(list);
    }

    if (info.thirdPartyNotices) {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = logoData.copyrightNoticeLabel;
      details.appendChild(summary);
      details.addEventListener('toggle', () => {
        if (!details.open || details.dataset.loaded === 'true') return;
        const pre = document.createElement('pre');
        pre.textContent = info.thirdPartyNotices;
        details.appendChild(pre);
        details.dataset.loaded = 'true';
      });
      container.appendChild(details);
    }

    for (const item of (info.thirdPartyDocuments || [])) addDocument(container, item);
  }).catch(() => { installed = false; });
}

window.LogoNotices = Object.freeze({install: installLogoNotices});
