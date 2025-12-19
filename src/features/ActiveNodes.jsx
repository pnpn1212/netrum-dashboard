import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; 
import { SignalHigh } from "lucide-react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const demoNodes = [];

export default function ActiveNodes() {
  const nodes = demoNodes; 

  const badgeClasses =
    "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/50 text-orange-50 shadow-[0_0_8px_rgba(249,115,22,0.25)]";

  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="p-4 border-b border-border bg-card/50 flex items-center gap-3">
        <div className="p-2.5 rounded-xl border border-white flex items-center justify-center">
          <SignalHigh className="h-5 w-5 text-primary" />
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider">
            Network Participants
          </h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Live node activity and performance
          </p>
        </div>

        <span className={cn("ml-auto", badgeClasses)}>
          {nodes.length} nodes
        </span>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="w-[100px]">Node ID</TableHead>
              <TableHead>CPU</TableHead>
              <TableHead>RAM</TableHead>
              <TableHead>Disk</TableHead>
              <TableHead>Speed</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-32 text-center text-muted-foreground"
              >
                Data will appear here once API is connected
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
