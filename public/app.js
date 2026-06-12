const SATOVUOSI = 2026;

const TYYPPINIMET = {
  kylvo: 'kylvö',
  lannoitus: 'lannoitus',
  ruiskutus: 'ruiskutus',
};

const state = {
  lohkot: [],
  toimenpideMaarat: {},
  valittuId: null,
};

const $ = (selector) => document.querySelector(selector);

async function api(path, options) {
  const res = await fetch(`/api${path}`, options);
  const body = res.status === 204 ? null : await res.json();
  if (!res.ok) {
    const message = body?.error?.message ?? `Pyyntö epäonnistui (${res.status})`;
    throw new Error(message);
  }
  return body;
}

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  Object.assign(node, props);
  node.append(...children);
  return node;
}

// ---------- Lohkolista ----------

function renderLohkoLista() {
  const list = $('#field-list');
  list.replaceChildren(
    ...state.lohkot.map((lohko) => {
      const maara = state.toimenpideMaarat[lohko.id] ?? 0;
      return el(
        'li',
        {
          className: lohko.id === state.valittuId ? 'active' : '',
          onclick: () => valitseLohko(lohko.id),
        },
        el(
          'div',
          { className: 'field-title' },
          el('span', { textContent: lohko.nimi }),
          el('span', { className: 'badge', textContent: `${maara} kirjausta` }),
        ),
        el('div', {
          className: 'area',
          textContent: `${lohko.pintaAlaHa} ha, ${lohko.kasvit[SATOVUOSI] ?? 'ei kasvia suunniteltu'}`,
        }),
      );
    }),
  );
  list.querySelectorAll('li').forEach((li, i) => {
    li.dataset.testid = 'field-item';
    li.dataset.fieldId = state.lohkot[i].id;
  });
}

// ---------- Lohkon tiedot ----------

function ravinnePalkki(label, kaytetty, raja) {
  const pct = raja > 0 ? Math.min((kaytetty / raja) * 100, 100) : 0;
  const fill = el('span');
  fill.style.width = `${pct}%`;
  if (pct > 90) fill.className = 'warn';
  const row = el(
    'div',
    { className: 'bar-row' },
    el('strong', { textContent: label.toUpperCase() }),
    el('div', { className: 'bar' }, fill),
    el('span', { textContent: `${kaytetty} / ${raja} kg/ha` }),
  );
  row.dataset.testid = `nutrient-bar-${label}`;
  return row;
}

function kuvaileToimenpide(tp) {
  switch (tp.tyyppi) {
    case 'kylvo':
      return `${tp.kasvi} '${tp.lajike}' (${tp.siementyyppi}), ${tp.kylvomaaraKgPerHa} kg/ha`;
    case 'lannoitus':
      return `${tp.tuote}, ${tp.maaraKgPerHa} kg/ha (N ${tp.ravinnepitoisuusPct.n} % / P ${tp.ravinnepitoisuusPct.p} % / K ${tp.ravinnepitoisuusPct.k} %)`;
    case 'ruiskutus':
      return `${tp.tuote} asteella BBCH ${tp.bbchAste}, aikaisin korjuu ${tp.aikaisinKorjuuPvm}`;
    default:
      return tp.tyyppi;
  }
}

async function renderTiedot() {
  const detail = $('#detail');
  if (!state.valittuId) {
    detail.hidden = true;
    return;
  }
  const [lohko, toimenpiteet] = await Promise.all([
    api(`/lohkot/${state.valittuId}?vuosi=${SATOVUOSI}`),
    api(`/lohkot/${state.valittuId}/toimenpiteet?vuosi=${SATOVUOSI}`),
  ]);
  state.toimenpideMaarat[lohko.id] = toimenpiteet.length;

  $('#field-name').textContent = lohko.nimi;
  $('#field-meta').textContent =
    `${lohko.pintaAlaHa} ha, ${lohko.ravinneTilanne?.kasvi.nimi ?? 'ei kasvia suunniteltu'}, satovuosi ${SATOVUOSI}`;

  const bars = $('#nutrient-bars');
  if (lohko.ravinneTilanne) {
    const { kaytettyKgPerHa, rajatKgPerHa } = lohko.ravinneTilanne;
    bars.replaceChildren(
      ravinnePalkki('n', kaytettyKgPerHa.n, rajatKgPerHa.n),
      ravinnePalkki('p', kaytettyKgPerHa.p, rajatKgPerHa.p),
      ravinnePalkki('k', kaytettyKgPerHa.k, rajatKgPerHa.k),
    );
  } else {
    bars.replaceChildren(
      el('p', { className: 'muted', textContent: 'Ei kasvia suunniteltu tälle vuodelle.' }),
    );
  }

  const note = $('#harvest-note');
  note.hidden = !lohko.aikaisinKorjuuPvm;
  if (lohko.aikaisinKorjuuPvm) {
    note.textContent = `Varoaika voimassa: aikaisin sallittu korjuupäivä ${lohko.aikaisinKorjuuPvm}.`;
  }

  $('#timeline').replaceChildren(
    ...toimenpiteet.map((tp) => {
      const item = el(
        'li',
        {},
        el('span', {
          className: `tag ${tp.tyyppi}`,
          textContent: TYYPPINIMET[tp.tyyppi] ?? tp.tyyppi,
        }),
        el('span', { className: 'pvm', textContent: tp.pvm }),
        el('span', { textContent: kuvaileToimenpide(tp) }),
      );
      item.dataset.testid = 'timeline-item';
      return item;
    }),
  );
  $('#timeline-empty').hidden = toimenpiteet.length > 0;

  renderLohkoLista();
  detail.hidden = false;
}

async function valitseLohko(id) {
  state.valittuId = id;
  renderLohkoLista();
  await renderTiedot();
}

// ---------- Toimenpidelomake ----------

function buildPayload(form) {
  const data = new FormData(form);
  const tyyppi = data.get('tyyppi');
  const pvm = data.get('pvm');
  if (tyyppi === 'lannoitus') {
    return {
      tyyppi,
      pvm,
      tuote: data.get('lannoite'),
      maaraKgPerHa: Number(data.get('maaraKgPerHa')),
      ravinnepitoisuusPct: {
        n: Number(data.get('nPct')),
        p: Number(data.get('pPct')),
        k: Number(data.get('kPct')),
      },
    };
  }
  if (tyyppi === 'ruiskutus') {
    return {
      tyyppi,
      pvm,
      tuote: data.get('kasvinsuojeluaine'),
      bbchAste: Number(data.get('bbchAste')),
    };
  }
  return {
    tyyppi,
    pvm,
    kasvi: data.get('kasvi'),
    lajike: data.get('lajike'),
    siementyyppi: data.get('siementyyppi'),
    kylvomaaraKgPerHa: Number(data.get('kylvomaaraKgPerHa')),
  };
}

function naytaPalaute(kind, text) {
  const feedback = $('#form-feedback');
  feedback.className = kind;
  feedback.textContent = text;
  feedback.hidden = false;
}

function initForm() {
  const form = $('#op-form');

  $('#op-type').addEventListener('change', (event) => {
    form.querySelectorAll('fieldset').forEach((fs) => {
      const active = fs.dataset.opType === event.target.value;
      fs.hidden = !active;
      fs.querySelectorAll('input, select').forEach((input) => {
        input.disabled = !active;
      });
    });
  });
  $('#op-type').dispatchEvent(new Event('change'));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!state.valittuId) return;
    try {
      const result = await api(`/lohkot/${state.valittuId}/toimenpiteet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(form)),
      });
      if (result.varoitukset.length > 0) {
        naytaPalaute('warning', `Tallennettu varoituksin: ${result.varoitukset.join(' / ')}`);
      } else {
        naytaPalaute('ok', 'Toimenpide tallennettu.');
      }
      await renderTiedot();
    } catch (err) {
      naytaPalaute('error', err.message);
    }
  });
}

async function initKatalogit() {
  const [aineet, kasvit] = await Promise.all([api('/kasvinsuojeluaineet'), api('/kasvit')]);
  $('[name=kasvinsuojeluaine]').replaceChildren(
    ...aineet.map((a) => el('option', { value: a.nimi, textContent: a.nimi })),
  );
  $('[name=kasvi]').replaceChildren(
    ...kasvit.map((k) => el('option', { value: k.koodi, textContent: k.nimi })),
  );
}

async function initToimenpideMaarat() {
  const maarat = await Promise.all(
    state.lohkot.map((lohko) =>
      api(`/lohkot/${lohko.id}/toimenpiteet?vuosi=${SATOVUOSI}`).then((tp) => [
        lohko.id,
        tp.length,
      ]),
    ),
  );
  state.toimenpideMaarat = Object.fromEntries(maarat);
}

async function init() {
  state.lohkot = await api('/lohkot');
  await initToimenpideMaarat();
  renderLohkoLista();
  await initKatalogit();
  initForm();
  if (state.lohkot.length > 0) {
    await valitseLohko(state.lohkot[0].id);
  }
}

init().catch((err) => {
  document.body.prepend(
    el('p', { className: 'error', textContent: `Lataus epäonnistui: ${err.message}` }),
  );
});
