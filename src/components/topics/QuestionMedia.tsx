import type { TopicChart, TopicQuestion, TopicTable } from '../../lib/topicBank';

function tablePayload(t: TopicTable | Record<string, unknown>): { headers: string[]; rows: string[][] } | null {
  const headers = (t as TopicTable).headers || (t as { columns?: string[] }).columns;
  const rows = (t as TopicTable).rows;
  if (!headers?.length || !rows?.length) return null;
  return { headers, rows: rows.map(r => r.map(String)) };
}

function ChartView({ chart }: { chart: TopicChart }) {
  const cats = chart.categories || [];
  const series = chart.series || [];
  if (!cats.length || !series.length) return null;
  const max = Math.max(1, ...series.flatMap(s => s.values || [0]));
  const colors = series.map((s, i) => s.color || ['#4dadff', '#ff8f70', '#3dd68c', '#ffc14d'][i % 4]);

  return (
    <div className="topic-chart">
      {chart.caption ? <p className="topic-chart-cap">{chart.caption}</p> : null}
      <div className="topic-chart-plot" role="img" aria-label="Bar chart">
        {cats.map((cat, i) => (
          <div className="topic-chart-col" key={`${cat}-${i}`}>
            <div className="topic-chart-bars">
              {series.map((s, si) => {
                const v = s.values[i] ?? 0;
                const h = Math.max(4, Math.round((v / max) * 120));
                return (
                  <div
                    key={si}
                    className="topic-chart-bar"
                    style={{ height: h, background: colors[si] }}
                    title={`${s.name}: ${v}`}
                  />
                );
              })}
            </div>
            <span className="topic-chart-cat">{cat}</span>
          </div>
        ))}
      </div>
      <div className="topic-chart-legend">
        {series.map((s, i) => (
          <span key={i}>
            <i style={{ background: colors[i] }} />
            {s.name || `Series ${i + 1}`}
          </span>
        ))}
      </div>
    </div>
  );
}

function TableView({ table }: { table: TopicTable | Record<string, unknown> }) {
  const data = tablePayload(table);
  if (!data) return null;
  return (
    <div className="topic-table-wrap">
      <table className="topic-table">
        <thead>
          <tr>
            {data.headers.map(h => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Passage + table/chart/figure for a topic question. */
export default function QuestionMedia({ q }: { q: TopicQuestion }) {
  const passage = (q.passage || '').trim();
  return (
    <>
      {passage ? <div className="topic-pass">{passage}</div> : null}
      {q.table ? <TableView table={q.table} /> : null}
      {q.chart && !q.figure ? <ChartView chart={q.chart} /> : null}
      {q.figure ? (
        <div className="topic-figure">
          <img
            src={q.figure}
            alt="Question diagram from paper"
            loading="lazy"
            onError={e => {
              const el = e.currentTarget;
              el.style.display = 'none';
              const wrap = el.parentElement;
              if (wrap) wrap.style.display = 'none';
            }}
          />
        </div>
      ) : null}
    </>
  );
}
