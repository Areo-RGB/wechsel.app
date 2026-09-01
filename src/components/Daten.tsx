import { useStore } from '../store';
import { formatTime } from '../lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Card } from './ui/card';

export function Daten() {
  const players = useStore(state => state.players);

  const stats = players
    .filter(p => p.feldzeit > 0 || p.bankzeit > 0)
    .map(p => {
      const total = p.feldzeit + p.bankzeit;
      const percent = total > 0 ? (p.feldzeit / total) * 100 : 0;
      return { ...p, total, percent };
    })
    .sort((a, b) => b.percent - a.percent);

  return (
    <div className="p-4 overflow-y-auto pb-24 h-full bg-stone-950">
      <h2 className="text-xl font-bold mb-6 text-stone-100">Daten</h2>
      <Card className="bg-stone-900 border-stone-800 overflow-hidden">
        <Table>
          <TableHeader className="bg-stone-950/50">
            <TableRow className="border-stone-800 hover:bg-transparent">
              <TableHead className="text-stone-400 font-medium">NAME</TableHead>
              <TableHead className="text-stone-400 font-medium text-right">Sp.</TableHead>
              <TableHead className="text-stone-400 font-medium text-right">%</TableHead>
              <TableHead className="text-stone-400 font-medium text-right">Σ min</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map(p => (
              <TableRow key={p.id} className="border-stone-800/50 text-stone-300 hover:bg-stone-800/50 transition-colors">
                <TableCell className="font-semibold">{p.name}</TableCell>
                <TableCell className="text-right font-mono">{formatTime(p.feldzeit)}</TableCell>
                <TableCell className="text-right font-mono text-emerald-500">{Math.round(p.percent)}%</TableCell>
                <TableCell className="text-right font-mono">{formatTime(p.total)}</TableCell>
              </TableRow>
            ))}
            {stats.length === 0 && (
              <TableRow className="hover:bg-transparent border-0">
                <TableCell colSpan={4} className="h-24 text-center text-stone-500">
                  Noch keine Daten vorhanden
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
