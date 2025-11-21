import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Database, RefreshCw, Download, Filter } from "lucide-react";
import { TorNode } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function DataCollection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const { data: nodes, isLoading } = useQuery<TorNode[]>({
    queryKey: ["/api/tor-nodes"],
  });

  const collectMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/tor-nodes/collect", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tor-nodes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Collection Complete",
        description: "TOR node data has been successfully collected from Onionoo API",
      });
    },
    onError: () => {
      toast({
        title: "Collection Failed",
        description: "Failed to collect TOR node data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredNodes = nodes?.filter((node) => {
    const matchesType = filterType === "all" || node.nodeType === filterType;
    const matchesSearch = 
      searchQuery === "" ||
      node.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.ipAddress.includes(searchQuery) ||
      node.fingerprint.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalPages = filteredNodes ? Math.ceil(filteredNodes.length / itemsPerPage) : 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNodes = filteredNodes?.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchQuery]);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">TOR Node Collection</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Automated extraction of TOR relay and node details from Onionoo API
          </p>
        </div>
        <Button
          onClick={() => collectMutation.mutate()}
          disabled={collectMutation.isPending}
          data-testid="button-collect-data"
        >
          {collectMutation.isPending ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Collecting...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Collect Node Data
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Entry/Guard Nodes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums text-chart-1">
              {nodes?.filter((n) => n.nodeType === "entry").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Middle Nodes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums text-chart-2">
              {nodes?.filter((n) => n.nodeType === "middle").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Exit Nodes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums text-chart-4">
              {nodes?.filter((n) => n.nodeType === "exit").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-medium">TOR Node Database</CardTitle>
              <CardDescription>Complete list of discovered TOR relays</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40" data-testid="select-filter-type">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="entry">Entry Nodes</SelectItem>
                  <SelectItem value="middle">Middle Nodes</SelectItem>
                  <SelectItem value="exit">Exit Nodes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Input
              placeholder="Search by nickname, IP, or fingerprint..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-nodes"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !filteredNodes || filteredNodes.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {nodes?.length === 0 ? "No nodes collected yet" : "No nodes match your filters"}
              </p>
              <Button
                onClick={() => collectMutation.mutate()}
                disabled={collectMutation.isPending}
                variant="outline"
                size="sm"
                className="mt-4"
                data-testid="button-collect-first"
              >
                <Database className="w-4 h-4 mr-2" />
                Collect TOR Nodes
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium uppercase">Nickname</TableHead>
                    <TableHead className="text-xs font-medium uppercase">Type</TableHead>
                    <TableHead className="text-xs font-medium uppercase">IP Address</TableHead>
                    <TableHead className="text-xs font-medium uppercase">Port</TableHead>
                    <TableHead className="text-xs font-medium uppercase">Fingerprint</TableHead>
                    <TableHead className="text-xs font-medium uppercase">Bandwidth</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentNodes?.map((node) => (
                    <TableRow key={node.id} data-testid={`node-row-${node.id}`}>
                      <TableCell className="font-medium">{node.nickname}</TableCell>
                      <TableCell>
                        <StatusBadge type="node" value={node.nodeType as any} />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{node.ipAddress}</TableCell>
                      <TableCell className="text-sm">{node.orPort}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {node.fingerprint.substring(0, 16)}...
                      </TableCell>
                      <TableCell className="text-sm tabular-nums">
                        {node.bandwidth ? `${(node.bandwidth / 1024 / 1024).toFixed(2)} MB/s` : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {filteredNodes && filteredNodes.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-muted-foreground text-center">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredNodes.length)} of {filteredNodes.length} nodes
              </p>
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
