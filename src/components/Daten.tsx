import { useStore } from '../store';
import { formatTime } from '../lib/utils';
import { getPlayerAvatar } from '../lib/avatars';
import { FullscreenButton } from './FullscreenButton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

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
    <div className="overflow-y-auto pb-16 h-full bg-white text-[#161616] flex flex-col select-none">
      {/* Condensed Header */}
      <div className="h-9 px-3 bg-[#f4f4f4] border-b border-[#e0e0e0] flex items-center justify-between shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-[0.32px] text-[#525252]">
          Spieldaten & Einsatzzeiten
        </h2>
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs text-[#161616] font-bold">
            {stats.length} Spieler
          </span>
          <FullscreenButton />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Table className="w-full text-xs">
          <TableHeader className="bg-[#f4f4f4] sticky top-0 z-10">
            <TableRow className="border-b border-[#e0e0e0] hover:bg-transparent h-7">
              <TableHead className="text-[#525252] font-semibold text-[10px] uppercase tracking-[0.32px] px-3">Name</TableHead>
              <TableHead className="text-[#525252] font-semibold text-[10px] uppercase tracking-[0.32px] text-right px-2">Spielzeit</TableHead>
              <TableHead className="text-[#525252] font-semibold text-[10px] uppercase tracking-[0.32px] text-right px-2">Anteil</TableHead>
              <TableHead className="text-[#525252] font-semibold text-[10px] uppercase tracking-[0.32px] text-right px-3">Gesamt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-[#e0e0e0]">
            {stats.map(p => {
              const avatar = getPlayerAvatar(p.name, p.avatar);
              return (
                <TableRow key={p.id} className="hover:bg-[#f4f4f4] transition-colors h-9">
                  <TableCell className="font-medium flex items-center space-x-2 py-1.5 px-3">
                    <div className="w-5 h-5 border border-[#e0e0e0] bg-[#f4f4f4] overflow-hidden flex items-center justify-center text-[9px] font-semibold text-[#161616] shrink-0">
                      {avatar ? (
                        <img src={avatar} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        p.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <span className="truncate max-w-[130px]">{p.name}</span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-[#161616] px-2">{formatTime(p.feldzeit)}</TableCell>
                  <TableCell className="text-right font-mono text-xs text-[#0f62fe] font-bold px-2">{Math.round(p.percent)}%</TableCell>
                  <TableCell className="text-right font-mono text-xs text-[#8c8c8c] px-3">{formatTime(p.total)}</TableCell>
                </TableRow>
              );
            })}
            {stats.length === 0 && (
              <TableRow className="hover:bg-transparent border-0">
                <TableCell colSpan={4} className="h-28 text-center text-[#8c8c8c] text-xs">
                  Noch keine Spieldaten vorhanden
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
