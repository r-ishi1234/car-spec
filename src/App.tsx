import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type DragEvent,
} from "react";
import { fetchVehicles } from "./api/vehicles";
import { MEMO_ITEM_LABELS } from "./displayMemo";
import { getSpecCellValue, isNumericLikeLabel } from "./specValueByLabel";
import { mergeOrderedSubset, reorderVisibleInFullOrder } from "./specListOrder";
import {
  VEHICLE_MANUFACTURERS,
  type ToyotaVehicleSpec,
  type VehicleManufacturer,
} from "./types/vehicleSpec";

const LS_KEY = "toyotaSpecItemVisibility";
const LS_KEY_VEHICLE = "toyotaSpecVehicleVisibility";
const LS_KEY_MAKER = "specViewerManufacturer";
const LS_KEY_ROW_ORDER = "toyotaSpecItemRowOrder";
const LS_KEY_COL_ORDER = "specVehicleColumnOrder";
const LS_SIDEBAR_OPEN = "toyotaSpecSidebarOpen";

const DND_MIME = "application/x-spec-reorder";

type ColumnOrderMap = Record<VehicleManufacturer, string[]>;

function parseStringArrayJson(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const p = JSON.parse(raw) as unknown;
    return Array.isArray(p)
      ? p.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

function loadRowOrderInitial(): string[] {
  try {
    return mergeOrderedSubset(
      parseStringArrayJson(localStorage.getItem(LS_KEY_ROW_ORDER)),
      MEMO_ITEM_LABELS
    );
  } catch {
    return [...MEMO_ITEM_LABELS];
  }
}

function loadColumnOrderMapInitial(): ColumnOrderMap {
  const empty: ColumnOrderMap = { Toyota: [], Honda: [], Nissan: [] };
  try {
    const raw = localStorage.getItem(LS_KEY_COL_ORDER);
    if (!raw) return empty;
    const p = JSON.parse(raw) as Record<string, unknown>;
    const out: ColumnOrderMap = { Toyota: [], Honda: [], Nissan: [] };
    for (const m of VEHICLE_MANUFACTURERS) {
      const v = p[m];
      if (Array.isArray(v)) {
        out[m] = v.filter((x): x is string => typeof x === "string");
      }
    }
    return out;
  } catch {
    return empty;
  }
}

function loadSidebarOpen(): boolean {
  try {
    return localStorage.getItem(LS_SIDEBAR_OPEN) !== "0";
  } catch {
    return true;
  }
}

function loadSavedVisibility(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "boolean") out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function buildVisibility(labels: string[]): Record<string, boolean> {
  const saved = loadSavedVisibility();
  const next: Record<string, boolean> = {};
  for (const label of labels) {
    next[label] = saved[label] !== false;
  }
  return next;
}

function loadSelectedManufacturer(): VehicleManufacturer {
  try {
    const raw = localStorage.getItem(LS_KEY_MAKER);
    if (
      raw &&
      (VEHICLE_MANUFACTURERS as readonly string[]).includes(raw)
    ) {
      return raw as VehicleManufacturer;
    }
    return "Toyota";
  } catch {
    return "Toyota";
  }
}

const MANUFACTURER_LABEL_JA: Record<VehicleManufacturer, string> = {
  Toyota: "トヨタ",
  Honda: "ホンダ",
  Nissan: "日産",
};

function manufacturerLabelJa(m: VehicleManufacturer): string {
  return MANUFACTURER_LABEL_JA[m];
}

function loadSavedVehicleVisibility(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(LS_KEY_VEHICLE);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "boolean") out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function vehicleMenuLabel(v: ToyotaVehicleSpec): string {
  return `${v.modelName} · ${v.grade}`;
}

/** 同一車種グループの販売年・世代メモ（modelYearNote）を1行にまとめる */
function groupModelYearNote(vehicles: ToyotaVehicleSpec[]): string | null {
  const raw = vehicles.map((v) => v.modelYearNote?.trim()).filter(Boolean);
  if (raw.length === 0) return null;
  const uniq = [...new Set(raw)];
  return uniq.join(" / ");
}

function App() {
  const [vehicles, setVehicles] = useState<ToyotaVehicleSpec[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ok" | "error">(
    "loading"
  );
  const [loadError, setLoadError] = useState("");

  const [visibleByLabel, setVisibleByLabel] = useState<Record<string, boolean>>(
    () => buildVisibility(MEMO_ITEM_LABELS)
  );
  const [rowOrder, setRowOrder] = useState<string[]>(loadRowOrderInitial);
  const [visibleByVehicleId, setVisibleByVehicleId] = useState<
    Record<string, boolean>
  >({});
  const [columnOrderByMaker, setColumnOrderByMaker] = useState<ColumnOrderMap>(
    loadColumnOrderMapInitial
  );
  const [selectedManufacturer, setSelectedManufacturer] =
    useState<VehicleManufacturer>(loadSelectedManufacturer);
  const [sidebarOpen, setSidebarOpen] = useState(loadSidebarOpen);
  const [confirmKind, setConfirmKind] = useState<
    "columnOrder" | "rowOrder" | null
  >(null);

  const reload = useCallback(() => {
    setLoadState("loading");
    setLoadError("");
    fetchVehicles()
      .then((rows) => {
        setVehicles(rows);
        setLoadState("ok");
      })
      .catch((e: unknown) => {
        setLoadState("error");
        setLoadError(e instanceof Error ? e.message : String(e));
      });
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!confirmKind) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmKind(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmKind]);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(visibleByLabel));
  }, [visibleByLabel]);

  useEffect(() => {
    if (rowOrder.length === 0) return;
    try {
      localStorage.setItem(LS_KEY_ROW_ORDER, JSON.stringify(rowOrder));
    } catch {
      /* ignore */
    }
  }, [rowOrder]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY_COL_ORDER, JSON.stringify(columnOrderByMaker));
    } catch {
      /* ignore */
    }
  }, [columnOrderByMaker]);

  useEffect(() => {
    setRowOrder((prev) => mergeOrderedSubset(prev, MEMO_ITEM_LABELS));
  }, []);

  useEffect(() => {
    if (vehicles.length === 0) {
      setVisibleByVehicleId({});
      return;
    }
    const saved = loadSavedVehicleVisibility();
    setVisibleByVehicleId((prev) => {
      const next: Record<string, boolean> = {};
      for (const v of vehicles) {
        const p = prev[v.id];
        next[v.id] = p !== undefined ? p : saved[v.id] !== false;
      }
      return next;
    });
  }, [vehicles]);

  useEffect(() => {
    setColumnOrderByMaker((prev) => {
      const next: ColumnOrderMap = { ...prev };
      let changed = false;
      for (const m of VEHICLE_MANUFACTURERS) {
        const ids = vehicles
          .filter((v) => v.manufacturer === m)
          .map((v) => v.id);
        const merged = mergeOrderedSubset(prev[m] ?? [], ids);
        if (merged.join("\u0001") !== (prev[m] ?? []).join("\u0001")) {
          next[m] = merged;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [vehicles]);

  useEffect(() => {
    if (Object.keys(visibleByVehicleId).length === 0) return;
    try {
      localStorage.setItem(
        LS_KEY_VEHICLE,
        JSON.stringify(visibleByVehicleId)
      );
    } catch {
      /* ignore */
    }
  }, [visibleByVehicleId]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_SIDEBAR_OPEN, sidebarOpen ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [sidebarOpen]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY_MAKER, selectedManufacturer);
    } catch {
      /* ignore */
    }
  }, [selectedManufacturer]);

  const setVisible = useCallback((label: string, on: boolean) => {
    setVisibleByLabel((prev) => ({ ...prev, [label]: on }));
  }, []);

  const showAll = useCallback(() => {
    setVisibleByLabel(
      Object.fromEntries(MEMO_ITEM_LABELS.map((l) => [l, true])) as Record<
        string,
        boolean
      >
    );
  }, []);

  const hideAll = useCallback(() => {
    setVisibleByLabel(
      Object.fromEntries(MEMO_ITEM_LABELS.map((l) => [l, false])) as Record<
        string,
        boolean
      >
    );
  }, []);

  const setVehicleVisible = useCallback((id: string, on: boolean) => {
    setVisibleByVehicleId((prev) => ({ ...prev, [id]: on }));
  }, []);

  const vehiclesForMaker = useMemo(
    () =>
      vehicles.filter((v) => v.manufacturer === selectedManufacturer),
    [vehicles, selectedManufacturer]
  );

  const showAllVehicles = useCallback(() => {
    setVisibleByVehicleId((prev) => {
      const next = { ...prev };
      for (const v of vehiclesForMaker) {
        next[v.id] = true;
      }
      return next;
    });
  }, [vehiclesForMaker]);

  const hideAllVehicles = useCallback(() => {
    setVisibleByVehicleId((prev) => {
      const next = { ...prev };
      for (const v of vehiclesForMaker) {
        next[v.id] = false;
      }
      return next;
    });
  }, [vehiclesForMaker]);

  const columnOrderMerged = useMemo(
    () =>
      mergeOrderedSubset(
        columnOrderByMaker[selectedManufacturer] ?? [],
        vehiclesForMaker.map((v) => v.id)
      ),
    [columnOrderByMaker, selectedManufacturer, vehiclesForMaker]
  );

  const displayVehicles = useMemo(() => {
    const byId = new Map(vehiclesForMaker.map((v) => [v.id, v]));
    return columnOrderMerged
      .filter((id) => visibleByVehicleId[id] !== false)
      .map((id) => byId.get(id))
      .filter((v): v is ToyotaVehicleSpec => v != null);
  }, [columnOrderMerged, vehiclesForMaker, visibleByVehicleId]);

  /** 表示順のまま隣接する同一車種を1グループに（API は車名・グレード順） */
  const vehicleColumnGroups = useMemo(() => {
    type Group = { modelName: string; vehicles: ToyotaVehicleSpec[] };
    const groups: Group[] = [];
    for (const v of displayVehicles) {
      const prev = groups[groups.length - 1];
      if (prev && prev.modelName === v.modelName) {
        prev.vehicles.push(v);
      } else {
        groups.push({ modelName: v.modelName, vehicles: [v] });
      }
    }
    return groups;
  }, [displayVehicles]);

  const hiddenVehicleColumns = useMemo(() => {
    const byId = new Map(vehiclesForMaker.map((v) => [v.id, v]));
    return columnOrderMerged
      .filter((id) => visibleByVehicleId[id] === false)
      .map((id) => byId.get(id))
      .filter((v): v is ToyotaVehicleSpec => v != null);
  }, [columnOrderMerged, vehiclesForMaker, visibleByVehicleId]);

  const visibleRows = useMemo(
    () => rowOrder.filter((l) => visibleByLabel[l]),
    [rowOrder, visibleByLabel]
  );

  const hiddenRows = useMemo(
    () => rowOrder.filter((l) => !visibleByLabel[l]),
    [rowOrder, visibleByLabel]
  );

  const onRowDragStart = useCallback((e: DragEvent, fromIndex: number) => {
    e.dataTransfer.setData(
      DND_MIME,
      JSON.stringify({ kind: "row", fromIndex })
    );
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const onRowDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onRowDrop = useCallback(
    (e: DragEvent, toIndex: number) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData(DND_MIME);
      if (!raw) return;
      try {
        const p = JSON.parse(raw) as { kind?: string; fromIndex?: number };
        const fromIdx = p.fromIndex;
        if (p.kind !== "row" || typeof fromIdx !== "number") return;
        if (fromIdx === toIndex) return;
        setRowOrder((prev) =>
          reorderVisibleInFullOrder(
            prev,
            (l) => visibleByLabel[l],
            fromIdx,
            toIndex
          )
        );
      } catch {
        /* ignore */
      }
    },
    [visibleByLabel]
  );

  const onColDragStart = useCallback((e: DragEvent, fromIndex: number) => {
    e.dataTransfer.setData(
      DND_MIME,
      JSON.stringify({ kind: "col", fromIndex })
    );
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const onColDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const resetColumnOrderForCurrentMaker = useCallback(() => {
    setConfirmKind("columnOrder");
  }, []);

  const resetRowOrderDefaults = useCallback(() => {
    setConfirmKind("rowOrder");
  }, []);

  const confirmDialogMessage =
    confirmKind === "columnOrder"
      ? "車種の並び順を初期化しますか？"
      : confirmKind === "rowOrder"
        ? "表示項目の並び順を初期化しますか？"
        : "";

  const onConfirmDialogConfirm = useCallback(() => {
    if (confirmKind === "columnOrder") {
      setColumnOrderByMaker((prev) => ({
        ...prev,
        [selectedManufacturer]: [],
      }));
    } else if (confirmKind === "rowOrder") {
      setRowOrder([...MEMO_ITEM_LABELS]);
      try {
        localStorage.removeItem(LS_KEY_ROW_ORDER);
      } catch {
        /* ignore */
      }
    }
    setConfirmKind(null);
  }, [confirmKind, selectedManufacturer]);

  const onColDrop = useCallback(
    (e: DragEvent, toIndex: number) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData(DND_MIME);
      if (!raw) return;
      try {
        const p = JSON.parse(raw) as { kind?: string; fromIndex?: number };
        const fromIdx = p.fromIndex;
        if (p.kind !== "col" || typeof fromIdx !== "number") return;
        if (fromIdx === toIndex) return;
        setColumnOrderByMaker((prev) => {
          const ids = vehiclesForMaker.map((v) => v.id);
          const order = mergeOrderedSubset(
            prev[selectedManufacturer] ?? [],
            ids
          );
          const nextOrder = reorderVisibleInFullOrder(
            order,
            (id) => visibleByVehicleId[id] !== false,
            fromIdx,
            toIndex
          );
          return { ...prev, [selectedManufacturer]: nextOrder };
        });
      } catch {
        /* ignore */
      }
    },
    [selectedManufacturer, vehiclesForMaker, visibleByVehicleId]
  );

  const showTable =
    loadState === "ok" &&
    displayVehicles.length > 0 &&
    visibleRows.length > 0;

  const sidebarStatus =
    loadState === "loading"
      ? "読み込み中…"
      : loadState === "error"
        ? null
        : vehiclesForMaker.length === 0
          ? "該当する車種がありません"
          : displayVehicles.length === 0
            ? "表示する車種を左でオンにしてください"
            : visibleRows.length === 0
              ? "表示する項目を左でオンにしてください"
              : null;

  return (
    <div className="app-layout">
      {confirmKind ? (
        <div
          className="confirm-dialog-backdrop"
          role="presentation"
          onClick={() => setConfirmKind(null)}
        >
          <div
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <p id="confirm-dialog-title" className="confirm-dialog__message">
              {confirmDialogMessage}
            </p>
            <div className="confirm-dialog__actions">
              <button
                type="button"
                className="confirm-dialog__btn confirm-dialog__btn--primary"
                onClick={onConfirmDialogConfirm}
              >
                はい
              </button>
              <button
                type="button"
                className="confirm-dialog__btn"
                onClick={() => setConfirmKind(null)}
              >
                いいえ
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {sidebarOpen ? (
      <aside className="item-menu" aria-label="操作メニュー">
        <div className="item-menu__top">
          <div className="item-menu__header-row">
            <div className="item-menu__header-text">
              <div className="maker-switch" role="tablist" aria-label="メーカー">
                {VEHICLE_MANUFACTURERS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={selectedManufacturer === m}
                    className={
                      "maker-switch__btn" +
                      (selectedManufacturer === m
                        ? " maker-switch__btn--active"
                        : "")
                    }
                    onClick={() => setSelectedManufacturer(m)}
                  >
                    {manufacturerLabelJa(m)}
                  </button>
                ))}
              </div>
              <h1 className="item-menu__h1">メーカー別 車種スペック</h1>
            </div>
            <button
              type="button"
              className="sidebar-toggle sidebar-toggle--close"
              onClick={() => setSidebarOpen(false)}
              aria-label="メニューを閉じる"
              title="メニューを閉じる"
            >
              ‹
            </button>
          </div>
          <p className="sidebar-meta" aria-live="polite">
            {loadState === "ok" ? (
              <>
                {displayVehicles.length} / {vehiclesForMaker.length} 列・
                {vehicleColumnGroups.length} 車種・{visibleRows.length} /{" "}
                {MEMO_ITEM_LABELS.length} 行項目
              </>
            ) : loadState === "loading" ? (
              "読み込み中…"
            ) : (
              "未取得"
            )}
          </p>
          {loadState === "error" && (
            <div className="sidebar-error" role="alert">
              <p className="sidebar-error__msg">{loadError}</p>
              <button type="button" className="btn-retry" onClick={reload}>
                再試行
              </button>
            </div>
          )}
          {sidebarStatus && loadState === "ok" && (
            <p className="sidebar-status">{sidebarStatus}</p>
          )}
        </div>

        <div className="item-menu__split">
          <div className="item-menu__pane">
            <div className="item-menu__block item-menu__block--pane">
              <h2 className="item-menu__block-title">車種</h2>
              <div className="item-menu__bulk">
                <button
                  type="button"
                  className="btn-tiny"
                  onClick={showAllVehicles}
                >
                  すべて表示
                </button>
                <button
                  type="button"
                  className="btn-tiny"
                  onClick={hideAllVehicles}
                >
                  すべて非表示
                </button>
                <button
                  type="button"
                  className="btn-tiny"
                  onClick={resetColumnOrderForCurrentMaker}
                  disabled={loadState !== "ok"}
                  title={`${manufacturerLabelJa(selectedManufacturer)}の列順のみ初期化`}
                >
                  表示順初期化
                </button>
              </div>
            </div>
            <div
              className="item-menu__pane-scroll"
              aria-label="車種の一覧"
            >
              <section className="item-menu__section">
                <h3 className="item-menu__section-title">
                  表示中{" "}
                  <span className="item-menu__count">
                    ({displayVehicles.length})
                  </span>
                </h3>
                <ul className="item-menu__list">
                  {displayVehicles.map((v, colIdx) => (
                    <li
                      key={v.id}
                      className="item-menu__draggable-li item-menu__draggable-li--split"
                      onDragOver={onColDragOver}
                      onDrop={(e) => onColDrop(e, colIdx)}
                    >
                      <div
                        className="item-menu__row-drag item-menu__row-drag--on"
                        draggable
                        onDragStart={(e) => onColDragStart(e, colIdx)}
                        aria-label={`${vehicleMenuLabel(v)} — ドラッグで列の順序を変更`}
                        title="ドラッグで並び替え"
                      >
                        <span className="item-menu__label">
                          {vehicleMenuLabel(v)}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="item-menu__row-hide-btn"
                        onClick={() => setVehicleVisible(v.id, false)}
                        title="列を非表示"
                        aria-label={`${vehicleMenuLabel(v)} を非表示`}
                      >
                        <span aria-hidden>−</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="item-menu__section">
                <h3 className="item-menu__section-title">
                  非表示{" "}
                  <span className="item-menu__count">
                    ({hiddenVehicleColumns.length})
                  </span>
                </h3>
                <ul className="item-menu__list">
                  {hiddenVehicleColumns.map((v) => (
                    <li key={v.id}>
                      <button
                        type="button"
                        className="item-menu__row item-menu__row--off"
                        onClick={() => setVehicleVisible(v.id, true)}
                        title="列を表示"
                      >
                        <span className="item-menu__label">
                          {vehicleMenuLabel(v)}
                        </span>
                        <span className="item-menu__action" aria-hidden>
                          +
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          <div className="item-menu__pane">
            <div className="item-menu__block item-menu__block--pane">
              <h2 className="item-menu__block-title">表示項目</h2>
              <div className="item-menu__bulk">
                <button type="button" className="btn-tiny" onClick={showAll}>
                  すべて表示
                </button>
                <button type="button" className="btn-tiny" onClick={hideAll}>
                  すべて非表示
                </button>
                <button
                  type="button"
                  className="btn-tiny"
                  onClick={resetRowOrderDefaults}
                  disabled={loadState !== "ok"}
                  title="表示項目の行順のみ初期化"
                >
                  表示順初期化
                </button>
              </div>
            </div>
            <div
              className="item-menu__pane-scroll"
              aria-label="表示項目の一覧"
            >
              <section className="item-menu__section">
                <h3 className="item-menu__section-title">
                  表示中{" "}
                  <span className="item-menu__count">({visibleRows.length})</span>
                </h3>
                <ul className="item-menu__list">
                  {visibleRows.map((label, rowIdx) => (
                    <li
                      key={label}
                      className="item-menu__draggable-li item-menu__draggable-li--split"
                      onDragOver={onRowDragOver}
                      onDrop={(e) => onRowDrop(e, rowIdx)}
                    >
                      <div
                        className="item-menu__row-drag item-menu__row-drag--on"
                        draggable
                        onDragStart={(e) => onRowDragStart(e, rowIdx)}
                        aria-label={`${label} — ドラッグで行の順序を変更`}
                        title="ドラッグで並び替え"
                      >
                        <span className="item-menu__label">{label}</span>
                      </div>
                      <button
                        type="button"
                        className="item-menu__row-hide-btn"
                        onClick={() => setVisible(label, false)}
                        title="非表示"
                        aria-label={`${label} を非表示`}
                      >
                        <span aria-hidden>−</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="item-menu__section">
                <h3 className="item-menu__section-title">
                  非表示{" "}
                  <span className="item-menu__count">({hiddenRows.length})</span>
                </h3>
                <ul className="item-menu__list">
                  {hiddenRows.map((label) => (
                    <li key={label}>
                      <button
                        type="button"
                        className="item-menu__row item-menu__row--off"
                        onClick={() => setVisible(label, true)}
                        title="表示"
                      >
                        <span className="item-menu__label">{label}</span>
                        <span className="item-menu__action" aria-hidden>
                          +
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      </aside>
      ) : (
        <div className="sidebar-rail" aria-label="メニュー操作">
          <button
            type="button"
            className="sidebar-toggle sidebar-toggle--open"
            onClick={() => setSidebarOpen(true)}
            aria-label="メニューを開く"
            title="メニューを開く"
          >
            ›
          </button>
        </div>
      )}

      <main className="main-panel">
        <div className="table-wrap">
          {showTable ? (
            <table className="spec-table spec-table--transpose">
              <thead>
                <tr className="spec-table__head-model">
                  <th
                    scope="col"
                    rowSpan={4}
                    className="spec-table__corner"
                  >
                    項目
                  </th>
                  {vehicleColumnGroups.map((g, gi) => (
                    <th
                      key={`${g.modelName}-${gi}`}
                      scope="colgroup"
                      colSpan={g.vehicles.length}
                      className="spec-table__model-head"
                    >
                      {g.modelName}
                    </th>
                  ))}
                </tr>
                <tr className="spec-table__head-gen">
                  {vehicleColumnGroups.map((g, gi) => {
                    const yearNote = groupModelYearNote(g.vehicles);
                    return (
                      <th
                        key={`gen-${g.modelName}-${gi}`}
                        scope="colgroup"
                        colSpan={g.vehicles.length}
                        className="spec-table__model-gen"
                      >
                        <span className="spec-table__model-gen-text">
                          {yearNote ?? "\u00a0"}
                        </span>
                      </th>
                    );
                  })}
                </tr>
                <tr className="spec-table__head-photo">
                  {vehicleColumnGroups.flatMap((g) =>
                    g.vehicles.map((v, vi) => (
                      <th
                        key={`img-${v.id}`}
                        scope="col"
                        className={
                          "spec-table__photo-cell" +
                          (vi === g.vehicles.length - 1
                            ? " spec-table__col-group-end"
                            : "")
                        }
                      >
                        {v.imageUrl ? (
                          <img
                            className="spec-table__header-img"
                            src={v.imageUrl}
                            alt={`${manufacturerLabelJa(v.manufacturer)}・${v.modelName}（参考画像）`}
                            loading="lazy"
                            decoding="async"
                            title="主に Wikimedia Commons の画像です。ライセンス・帰属は各ファイルページを参照してください。"
                          />
                        ) : (
                          "\u00a0"
                        )}
                      </th>
                    ))
                  )}
                </tr>
                <tr className="spec-table__head-grade">
                  {vehicleColumnGroups.flatMap((g) =>
                    g.vehicles.map((v, vi) => (
                      <th
                        key={v.id}
                        scope="col"
                        className={
                          "spec-table__grade" +
                          (vi === g.vehicles.length - 1
                            ? " spec-table__col-group-end"
                            : "")
                        }
                      >
                        {v.grade}
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((label) => {
                  const numeric = isNumericLikeLabel(label);
                  return (
                    <tr key={label}>
                      <th scope="row" className="spec-table__rowhead">
                        {label}
                      </th>
                      {vehicleColumnGroups.flatMap((g) =>
                        g.vehicles.map((v, vi) => (
                          <td
                            key={v.id}
                            className={
                              (numeric ? "cell-num " : "") +
                              "spec-table__cell" +
                              (vi === g.vehicles.length - 1
                                ? " spec-table__col-group-end"
                                : "")
                            }
                          >
                            {getSpecCellValue(label, v)}
                          </td>
                        ))
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="table-wrap__placeholder" aria-hidden />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
