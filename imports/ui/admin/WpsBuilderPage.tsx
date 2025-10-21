import React, { useState, useRef, useMemo } from 'react';
import { Overlay, Tooltip } from 'react-bootstrap';
// React import ensures JSX namespace is available for typing
import { wpsQuestions } from '../../api/wpsQuestionBank';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';
import { Container, Row, Col, Button, Table } from 'react-bootstrap';
import BuildModal from '/imports/ui/wps/BuildModal';
import IndicatorDetailsModal from '/imports/ui/wps/IndicatorDetailsModal';
import { useTheme } from '/imports/contexts/ThemeContext';

// Centralized zones
const ZONES = [
  { id: 'SZN-1', label: 'Built Environment' },
  { id: 'SZN-2', label: 'Knowledge Equity' },
  { id: 'SZN-3', label: 'Well-Being' },
  { id: 'SZN-4', label: 'Behavior' },
  { id: 'SZN-5', label: 'Workplace' },
  { id: 'SZN-6', label: 'Inclusion' },
];

// Tooltip CSS moved out of return
const TOOLTIP_CSS = `
  .tooltip.show {
    background: #fff !important;
    color: #222 !important;
  }
  .tooltip .tooltip-inner {
    background: #fff !important;
    background-color: #fff !important;
    color: #222 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    padding: 12px 16px;
    border: none !important;
    opacity: 1 !important;
    width: 400px !important;
    min-width: 240px !important;
    max-width: 100% !important;
    height: 100% !important;
    box-sizing: border-box !important;
    display: block !important;
  }
  .tooltip.show {
    opacity: 1 !important;
  }
  .bs-tooltip-end .tooltip-arrow::before, .bs-tooltip-auto[data-popper-placement^="right"] .tooltip-arrow::before,
  .bs-tooltip-start .tooltip-arrow::before, .bs-tooltip-auto[data-popper-placement^="left"] .tooltip-arrow::before,
  .bs-tooltip-top .tooltip-arrow::before, .bs-tooltip-auto[data-popper-placement^="top"] .tooltip-arrow::before,
  .bs-tooltip-bottom .tooltip-arrow::before, .bs-tooltip-auto[data-popper-placement^="bottom"] .tooltip-arrow::before {
    background: #fff !important;
    background-color: #fff !important;
    opacity: 1 !important;
  }
  .tooltip .tooltip-arrow, .bs-tooltip-auto[data-popper-placement^="right"] .tooltip-arrow::before,
  .bs-tooltip-end .tooltip-arrow::before, .bs-tooltip-start .tooltip-arrow::before,
  .bs-tooltip-top .tooltip-arrow::before, .bs-tooltip-bottom .tooltip-arrow::before {
    border: none !important;
    background: transparent !important;
  }
  .bs-tooltip-end .tooltip-arrow::before, .bs-tooltip-auto[data-popper-placement^="right"] .tooltip-arrow::before {
    content: '';
    display: block;
    width: 0; height: 0;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-left: 10px solid #fff;
    margin-left: -1px;
  }
  .bs-tooltip-start .tooltip-arrow::before, .bs-tooltip-auto[data-popper-placement^="left"] .tooltip-arrow::before {
    content: '';
    display: block;
    width: 0; height: 0;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-right: 10px solid #fff;
    margin-right: -1px;
  }
  .bs-tooltip-top .tooltip-arrow::before, .bs-tooltip-auto[data-popper-placement^="top"] .tooltip-arrow::before {
    content: '';
    display: block;
    width: 0; height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 10px solid #fff;
    margin-bottom: -1px;
  }
  .bs-tooltip-bottom .tooltip-arrow::before, .bs-tooltip-auto[data-popper-placement^="bottom"] .tooltip-arrow::before {
    content: '';
    display: block;
    width: 0; height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 10px solid #fff;
    margin-top: -1px;
  }
`;

// Responsive CSS specifically for zone buttons layout
const RESPONSIVE_ZONE_CSS = `
  /* Zone buttons responsive layout */
  .wps-zone-filters { flex-wrap: wrap; }
  .wps-zone-filters .wps-zone-item { position: relative; }
  .wps-zone-filters .wps-zone-btn { min-width: 130px; padding:.65rem .85rem; line-height:1.1; font-weight:600; }
  .wps-zone-filters .wps-zone-btn.btn-outline-primary { --bs-btn-color:#6c47b6; }
  .wps-zone-filters .wps-zone-btn.btn-primary { background:var(--color-primary, #542A46); border-color:var(--color-primary, #542A46); }
  .wps-zone-filters .wps-zone-btn.btn-primary:hover, .wps-zone-filters .wps-zone-btn.btn-primary:focus { background:#5d334f; border-color:#5d334f; }
  .wps-zone-filters .wps-zone-btn:focus { box-shadow:0 0 0 .15rem rgba(108,71,182,.35); }
  @media (max-width: 1199.98px) { /* lg breakpoint */
    .wps-zone-filters { gap: .75rem; }
    .wps-zone-filters .wps-zone-btn { min-width: 125px; }
  }
  @media (max-width: 991.98px) { /* md */
    .wps-zone-filters { gap: .65rem; }
    .wps-zone-filters .wps-zone-btn { flex: 1 1 calc(50% - .65rem); min-width: 0; }
  }
  @media (max-width: 767.98px) { /* sm */
    .wps-zone-filters { gap: .5rem; }
    .wps-zone-filters .wps-zone-btn { flex: 1 1 calc(50% - .5rem); padding: .7rem .65rem; font-size: .85rem; }
  }
  @media (max-width: 575.98px) { /* xs */
    .wps-zone-filters { gap: .5rem; }
    .wps-zone-filters .wps-zone-btn { flex: 1 1 100%; font-size: .85rem; }
    .wps-zone-filters-counter { width: 100%; margin-top: .25rem; justify-content: flex-start !important; border-left: none !important; padding-left: 0 !important; }
  }
  /* Action panel styling */
  .wps-action-panel { display:flex; flex-direction:column; align-items:stretch; gap:.65rem; background:#fff; padding:.75rem .9rem .9rem; border:1px solid #e2dff0; border-radius:.75rem; box-shadow:0 2px 6px rgba(40,20,70,.06); min-width:260px; }
  .wps-action-panel .btn { font-weight:600; }
  .wps-action-panel-row { display:flex; gap:.5rem; }
  .wps-indicator-pill { background:#fdfdfe; color:#6c757d; font-size:16px; padding:0; border-radius:.375rem; display:flex; align-items:stretch; gap:0; cursor:pointer; font-weight:600; letter-spacing:.25px; width:100%; justify-content:center; border:1px solid #6c757d; transition:background-color .18s ease, box-shadow .18s ease, border-color .18s ease; text-align:center; overflow:hidden; }
  .wps-indicator-pill .label { padding:.6rem .9rem; display:inline-flex; align-items:center; }
  .wps-indicator-pill:hover { background:#f5f6f8; }
  .wps-indicator-pill:hover { background:#f3eef7; }
  .wps-indicator-pill:focus { outline:2px solid #bca3ec; outline-offset:2px; }
  .wps-indicator-pill .count { color:#fff; padding:.3rem .6rem; border-radius:.35rem; font-size:.9rem; line-height:1; font-weight:700; min-width:2.3rem; text-align:center; box-shadow:0 1px 2px rgba(0,0,0,.12); display:inline-flex; align-items:center; justify-content:center; margin:.3rem; }
  @media (max-width: 767.98px) { /* stack action panel */
    .wps-action-panel { flex-direction:row; flex-wrap:wrap; align-items:center; padding:.75rem; }
    .wps-action-panel-row { flex:1 1 100%; }
  }
`;

// Shared styles
const STYLES = {
  title: (color: string | undefined): React.CSSProperties => ({
    color: color || 'var(--color-text)',
  }),
  zoneWrapper: { position: 'relative', display: 'inline-block' } as React.CSSProperties,
  zoneButtonPos: { position: 'relative' } as React.CSSProperties,
  zoneBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    background: '#6c47b6',
    color: '#fff',
    borderRadius: '50%',
    minWidth: 22,
    height: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    boxShadow: '0 1px 4px rgba(80,40,120,0.12)',
    zIndex: 2,
    border: '2px solid #fff',
    pointerEvents: 'none',
  } as React.CSSProperties,
  thStandard: { width: '30%' } as React.CSSProperties,
  thIndicator: { width: '70%' } as React.CSSProperties,
  standardCellBase: {
    verticalAlign: 'middle',
    position: 'relative',
    transition: 'background-color 120ms ease-out',
  } as React.CSSProperties,
  indicatorCellBase: {
    transition: 'background-color 120ms ease-out',
  } as React.CSSProperties,
  infoIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    marginLeft: 8,
    cursor: 'pointer',
    color: '#888',
    fontSize: 17,
  } as React.CSSProperties,
  tooltipBox: {
    width: 400,
    minWidth: 240,
    whiteSpace: 'pre-line',
    fontSize: 15,
    fontWeight: 400,
    background: '#fff',
    color: '#222',
    border: 'none',
    borderRadius: 8,
    boxShadow: '0 2px 12px #d8d8e0',
    padding: '12px 16px',
    zIndex: 9999,
    boxSizing: 'border-box',
    display: 'block',
  } as React.CSSProperties,
  detailsBtn: { minWidth: 70 } as React.CSSProperties,
};

// Pure helpers
const sortWPSIDs = (wpsids: string[]) =>
  wpsids.slice().sort((a, b) => {
    const numA = parseInt(a.replace(/^WPS/, ''), 10);
    const numB = parseInt(b.replace(/^WPS/, ''), 10);
    return numA - numB;
  });

const filterRequiredByZone = (activeFilter: string, bank: typeof wpsQuestions) =>
  bank.filter(item =>
    `SZN-${item.SZN}` === activeFilter &&
    typeof item['AUTHORITY CATEGORY'] === 'string' &&
    item['AUTHORITY CATEGORY'].includes('(Required)')
  );

type IndicatorMapEntry = { standard: string; indicator: string; wpsids: string[] };

const buildIndicatorMap = (items: ReturnType<typeof filterRequiredByZone>) => {
  const map = new Map<string, IndicatorMapEntry>();
  items.forEach(item => {
    if (!map.has(item.INDICATOR)) {
      map.set(item.INDICATOR, { standard: item.STANDARD, indicator: item.INDICATOR, wpsids: [item.WPSID] });
    } else {
      const entry = map.get(item.INDICATOR)!;
      if (!entry.wpsids.includes(item.WPSID)) entry.wpsids.push(item.WPSID);
    }
  });
  // sort each entry's wpsids
  map.forEach(entry => (entry.wpsids = sortWPSIDs(entry.wpsids)));
  return map;
};

const groupIndicatorsByStandard = (map: Map<string, IndicatorMapEntry>) => {
  const grouped: Record<string, string[]> = {};
  map.forEach(({ standard, indicator }) => {
    if (!grouped[standard]) grouped[standard] = [];
    grouped[standard].push(indicator);
  });
  return grouped;
};

const getStandardDescription = (bank: typeof wpsQuestions, standard: string) => {
  const found = bank.find(item => item.STANDARD === standard && item['STANDARD DESCRIPTION']);
  return found ? found['STANDARD DESCRIPTION'] : 'No description available.';
};

const computeSznCounts = (selected: string[], bank: typeof wpsQuestions) => {
  const sznCounts: Record<string, number> = {};
  const indicatorToZone: Record<string, { szn: string; wpsids: string[] }> = {};
  bank.forEach(item => {
    const key = item.INDICATOR;
    const szn = `SZN-${item.SZN}`;
    if (!indicatorToZone[key]) {
      indicatorToZone[key] = { szn, wpsids: [item.WPSID] };
    } else {
      indicatorToZone[key].wpsids.push(item.WPSID);
    }
  });
  Object.values(indicatorToZone).forEach(({ szn, wpsids }) => {
    if (wpsids.some(w => selected.includes(w))) {
      sznCounts[szn] = (sznCounts[szn] || 0) + 1;
    }
  });
  return sznCounts;
};

// Count distinct indicators represented in the current selection
const computeSelectedIndicatorCount = (selected: string[], bank: typeof wpsQuestions) => {
  if (!selected.length) return 0;
  const indicatorSelected = new Set<string>();
  bank.forEach(item => {
    if (selected.includes(item.WPSID)) indicatorSelected.add(item.INDICATOR);
  });
  return indicatorSelected.size;
};

// Interpolated color for counter across thresholds (0,16,40,60)
const interpolateCountColor = (value: number) => {
  const stops = [[0,'#6c757d'],[16,'#198754'],[40,'#fd7e14'],[60,'#dc3545']] as const;
  if (value <= stops[0][0]) return stops[0][1];
  if (value >= stops[stops.length - 1][0]) return stops[stops.length - 1][1];
  for (let i = 0; i < stops.length - 1; i++) {
    const [v1,c1] = stops[i];
    const [v2,c2] = stops[i+1];
    if (value <= v2) {
      const t = (value - v1) / (v2 - v1);
      const hexToRgb = (h: string) => h.slice(1).match(/../g)!.map(x => parseInt(x,16));
      const [r1,g1,b1] = hexToRgb(c1); const [r2,g2,b2] = hexToRgb(c2);
      const lerp = (a:number,b:number)=>Math.round(a + (b-a)*t);
      return `rgb(${lerp(r1,r2)}, ${lerp(g1,g2)}, ${lerp(b1,b2)})`;
    }
  }
  return stops[stops.length - 1][1];
};

const getStandardCellStyle = (hovered: boolean): React.CSSProperties => ({
  ...STYLES.standardCellBase,
  backgroundColor: hovered ? '#f1eaff' : undefined,
});

const getIndicatorCellStyle = (hovered: boolean): React.CSSProperties => ({
  ...STYLES.indicatorCellBase,
  backgroundColor: hovered ? '#f1eaff' : undefined,
});

const WpsBuilderPage: React.FC = () => {
  const theme = useTheme();
  const [activeFilter, setActiveFilter] = useState('SZN-1');
  // Track selected WPSIDs
  const [selectedWPSIDs, setSelectedWPSIDs] = useState<string[]>([]);
  // Hover state for custom highlight behavior
  const [hoveredStandard, setHoveredStandard] = useState<string | null>(null);
  const [hoveredIndicator, setHoveredIndicator] = useState<string | null>(null);
  // Modal state
  const [showModal, setShowModal] = useState(false);
  // Tooltip state for standards (must be inside component)
  const [tooltipStandard, setTooltipStandard] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTargetRefs = useRef<Record<string, HTMLElement | null>>({});

  // Indicator details modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsIndicator, setDetailsIndicator] = useState<string | null>(null);
  const [detailsDescription, setDetailsDescription] = useState<string | undefined>(undefined);
  const [detailsRelevance, setDetailsRelevance] = useState<string | undefined>(undefined);

  // Counter tooltip state
  const [showCounterTooltip, setShowCounterTooltip] = useState(false);
  const counterTooltipRef = useRef<HTMLDivElement | null>(null);
  const counterTooltipText = 'WPS surveys provide the most value at 16 indicators. Going below does not guarantee sufficient user data for effective decision-making, while going above may cause respondent fatigue and skew final results.';
  const counterTooltipMarkup = (
    <>
  WPS surveys provide the most value at <strong>16 indicators</strong>. Going <strong style={{ color: '#6c757d' }}>below</strong> does not guarantee sufficient user data for effective decision-making, while going <strong style={{ color: '#dc3545' }}>above</strong> may cause respondent fatigue and skew final results.
    </>
  );

  const handleShowDetails = (indicator: string) => {
    // Find the first matching entry for this indicator in wpsQuestionsBank
    const found = wpsQuestions.find(item => item.INDICATOR === indicator);
    setDetailsIndicator(indicator);
    setDetailsDescription(found ? found["INDICATOR DESCRIPTION"] : undefined);
    setDetailsRelevance(found ? found["INDICATOR RELEVANCE"] : undefined);
    setShowDetailsModal(true);
  };
  const handleCloseDetails = () => setShowDetailsModal(false);

  // Replace ad-hoc sznCounts computation with memoized helper
  const sznCounts = useMemo(
    () => computeSznCounts(selectedWPSIDs, wpsQuestions),
    [selectedWPSIDs]
  );

  // Total distinct indicators selected (across all zones)
  const selectedIndicatorCount = useMemo(
    () => computeSelectedIndicatorCount(selectedWPSIDs, wpsQuestions),
    [selectedWPSIDs]
  );

  // Dynamic color for the selected indicator counter
  const selectionCountColor = useMemo(
    () => interpolateCountColor(selectedIndicatorCount),
    [selectedIndicatorCount]
  );

  // Build button handler
  const handleBuildClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  // Update add/remove all using hoisted sorter
  const handleAddRemoveClick = (indicator: string, wpsids: string[]) => {
    const anySelected = wpsids.some(wpsid => selectedWPSIDs.includes(wpsid));
    if (anySelected) {
      // Remove all for this indicator
      setSelectedWPSIDs(prev => sortWPSIDs(prev.filter(id => !wpsids.includes(id))));
    } else {
      // Add all for this indicator (avoid duplicates)
      setSelectedWPSIDs(prev => sortWPSIDs(Array.from(new Set([...prev, ...wpsids]))));
    }
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const id = e.currentTarget.id;
    setActiveFilter(id);
  };

  // Render helpers to keep return minimal
  const renderZoneFilters = () => (
    <div className="d-flex wps-zone-filters gap-2 align-items-center">
      {ZONES.map(({ id, label }) => (
        <div key={id} className="wps-zone-item" style={STYLES.zoneWrapper}>
          <Button
            variant={activeFilter === id ? 'primary' : 'outline-primary'}
            id={id}
            onClick={handleButtonClick}
            active={activeFilter === id}
            style={STYLES.zoneButtonPos}
            className="wps-zone-btn"
          >
            {label}
          </Button>
            {sznCounts[id] > 0 && <span style={STYLES.zoneBadge}>{sznCounts[id]}</span>}
        </div>
      ))}
    </div>
  );

  const renderTableBody = () => {
    const filtered = filterRequiredByZone(activeFilter, wpsQuestions);
    const indicatorMap = buildIndicatorMap(filtered);
    const grouped = groupIndicatorsByStandard(indicatorMap);

    const rows: React.ReactElement[] = [];
    Object.entries(grouped).forEach(([standard, indicators]) => {
      (indicators as string[]).forEach((indicator: string, idx: number) => {
        const entry = indicatorMap.get(indicator);
        const wpsids = entry?.wpsids || [];
        const anySelected = wpsids.some(w => selectedWPSIDs.includes(w));
        // Tooltip trigger ref for this standard
        if (!tooltipTargetRefs.current[standard]) tooltipTargetRefs.current[standard] = null;

        rows.push(
          <tr key={standard + '-' + indicator}>
            {idx === 0 && (
              <td
                rowSpan={(indicators as string[]).length}
                style={getStandardCellStyle(hoveredStandard === standard)}
                onMouseEnter={() => setHoveredStandard(standard)}
                onMouseLeave={() => setHoveredStandard(null)}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {standard}
                  <span
                    ref={el => {
                      tooltipTargetRefs.current[standard] = el;
                    }}
                    style={STYLES.infoIcon}
                    onClick={e => {
                      e.stopPropagation();
                      setTooltipStandard(standard);
                      setShowTooltip(s => !s || tooltipStandard !== standard);
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="10" cy="10" r="9" stroke="#888" strokeWidth="2" fill="#fff" />
                      <text x="10" y="15" textAnchor="middle" fontSize="13" fill="#888" fontWeight="bold">i</text>
                    </svg>
                  </span>
                  <Overlay
                    target={tooltipTargetRefs.current[standard]}
                    show={showTooltip && tooltipStandard === standard}
                    placement="right"
                    rootClose
                    onHide={() => setShowTooltip(false)}
                  >
                    <Tooltip id={`tooltip-${standard}`} style={STYLES.tooltipBox}>
                      <div style={{ fontWeight: 600, color: '#6c47b6', marginBottom: 4 }}>Standard Description</div>
                      <div>{getStandardDescription(wpsQuestions, standard)}</div>
                    </Tooltip>
                  </Overlay>
                </span>
              </td>
            )}
            <td
              className="d-flex align-items-center justify-content-between"
              onMouseEnter={() => {
                setHoveredIndicator(indicator);
                setHoveredStandard(standard);
              }}
              onMouseLeave={() => {
                setHoveredIndicator(null);
                setHoveredStandard(null);
              }}
              style={getIndicatorCellStyle(hoveredIndicator === indicator)}
            >
              <span>{indicator}</span>
              <div className="d-flex gap-2">
                {(() => {
                  const isDetailsActive = showDetailsModal && detailsIndicator === indicator;
                  return (
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      active={isDetailsActive}
                      onClick={() => handleShowDetails(indicator)}
                      style={STYLES.detailsBtn}
                    >
                      Details
                    </Button>
                  );
                })()}
                <Button
                  size="sm"
                  variant={anySelected ? 'primary' : 'outline-primary'}
                  onClick={() => handleAddRemoveClick(indicator, wpsids)}
                >
                  {anySelected ? 'Remove' : 'Add'}
                </Button>
              </div>
            </td>
          </tr>
        );
      });
    });
    return rows;
  };

  return (
    <>
  <style>{TOOLTIP_CSS + RESPONSIVE_ZONE_CSS}</style>
      <AdminLayout>
        {/* Indicator Details Modal */}
        <IndicatorDetailsModal
          show={showDetailsModal}
          onHide={handleCloseDetails}
          indicator={detailsIndicator}
          description={detailsDescription}
          relevance={detailsRelevance}
        />
        <Container>
        {/* Build Modal */}
        <BuildModal show={showModal} onHide={handleCloseModal} wpsids={selectedWPSIDs} />
        <Row className="mb-4">
          <Col>
            <h1 className="fw-bold" style={STYLES.title(theme.textColor)}>
              Whole Person Safety Builder
            </h1>
          </Col>
        </Row>
        <Row className="mb-4">
          <Col className="d-flex gap-2 justify-content-between align-items-center">
            {renderZoneFilters()}
            <div className="wps-action-panel ms-auto">
              <div className="wps-action-panel-row">
                <Button variant="outline-secondary" onClick={() => setSelectedWPSIDs([])} className="flex-fill">
                  Clear
                </Button>
                <Button variant="dark" onClick={handleBuildClick} className="flex-fill">
                  Build
                </Button>
              </div>
              <div style={{ lineHeight: 1 }}>
                <div
                  ref={counterTooltipRef}
                  className="wps-indicator-pill"
                  style={{ background:'#fff', border:'1px solid #6c757d', textDecoration:'none', width:'100%' }}
                  onClick={() => setShowCounterTooltip(v => !v)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowCounterTooltip(v => !v); }
                    if (e.key === 'Escape') { setShowCounterTooltip(false); }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-haspopup="dialog"
                  aria-expanded={showCounterTooltip}
                  aria-label={counterTooltipText}
                >
                  <span className="label" style={{ fontWeight:600, color:'#6c757d' }}>Indicators</span>
                  <span className="count" style={{ background: selectionCountColor }}>{selectedIndicatorCount}</span>
                </div>
                <Overlay
                  target={counterTooltipRef.current}
                  show={showCounterTooltip}
                  placement="bottom"
                  rootClose
                  onHide={() => setShowCounterTooltip(false)}
                >
                  <Tooltip id="tooltip-selected-indicators" style={STYLES.tooltipBox}>
                    <div style={{ fontWeight: 600, color: '#6c47b6', marginBottom: 4 }}>Guidance</div>
                    <div>{counterTooltipMarkup}</div>
                  </Tooltip>
                </Overlay>
              </div>
            </div>
          </Col>
        </Row>
         <Row>
           <Col>
             <Table bordered responsive>
               <thead>
                 <tr>
                   <th style={STYLES.thStandard}>Standard</th>
                   <th style={STYLES.thIndicator}>Indicator</th>
                 </tr>
               </thead>
               <tbody>{renderTableBody()}</tbody>
             </Table>
           </Col>
         </Row>
      </Container>
      </AdminLayout>
    </>
  );
};

export default WpsBuilderPage;
