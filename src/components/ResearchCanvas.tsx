import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { JsonBlock } from '@/types/blocks';

interface ResearchCanvasProps {
  blocks: JsonBlock[];
}

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

export function ResearchCanvas({ blocks }: ResearchCanvasProps) {
  if (!blocks || blocks.length === 0) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        No research output yet. Ask a question to generate the canvas.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'title':
            return (
              <h1 key={index} className="text-2xl font-semibold">
                {block.text}
              </h1>
            );
          case 'section':
            return (
              <h2 key={index} className="text-lg font-semibold">
                {block.text}
              </h2>
            );
          case 'paragraph':
            return (
              <p key={index} className="text-sm leading-relaxed text-foreground">
                {block.text}
              </p>
            );
          case 'bullets':
            return (
              <Card key={index} className="p-4">
                {block.title && <div className="font-semibold mb-2">{block.title}</div>}
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {block.items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </Card>
            );
          case 'table':
            return (
              <Card key={index} className="p-4 overflow-x-auto">
                {block.title && <div className="font-semibold mb-2">{block.title}</div>}
                <Table>
                  <TableHeader>
                    <TableRow>
                      {block.columns.map((col, idx) => (
                        <TableHead key={idx}>{col}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {block.rows.map((row, rowIdx) => (
                      <TableRow key={rowIdx}>
                        {row.map((cell, cellIdx) => (
                          <TableCell key={cellIdx}>{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            );
          case 'chart': {
            const chartData = block.labels.map((label, idx) => {
              const entry: Record<string, string | number> = { label };
              block.series.forEach((series) => {
                entry[series.name] = series.data[idx] ?? 0;
              });
              return entry;
            });

            return (
              <Card key={index} className="p-4">
                {block.title && <div className="font-semibold mb-2">{block.title}</div>}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    {block.chart_type === 'bar' && (
                      <BarChart data={chartData}>
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {block.series.map((series) => (
                          <Bar key={series.name} dataKey={series.name} fill="#6366f1" />
                        ))}
                      </BarChart>
                    )}
                    {block.chart_type === 'line' && (
                      <LineChart data={chartData}>
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {block.series.map((series) => (
                          <Line
                            key={series.name}
                            type="monotone"
                            dataKey={series.name}
                            stroke="#6366f1"
                            strokeWidth={2}
                          />
                        ))}
                      </LineChart>
                    )}
                    {block.chart_type === 'pie' && (
                      <PieChart>
                        <Tooltip />
                        <Legend />
                        <Pie
                          data={chartData}
                          dataKey={block.series[0]?.name || 'value'}
                          nameKey="label"
                          outerRadius={90}
                        >
                          {chartData.map((_, idx) => (
                            <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </Card>
            );
          }
          case 'image':
            return (
              <Card key={index} className="p-4 space-y-2">
                {block.title && <div className="font-semibold">{block.title}</div>}
                {block.url ? (
                  <img
                    src={block.url}
                    alt={block.description || block.title || 'Generated visual'}
                    className="w-full rounded-md"
                  />
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {block.description || 'Image placeholder'}
                    {block.prompt && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Prompt: {block.prompt}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
