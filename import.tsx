import { useState, useEffect, useCallback } from 'react';
import { client } from '@/lib/client';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, BarChart3 } from 'lucide-react';
import StopCalculator from '@/components/StopCalculator';
import OperationForm from '@/components/OperationForm';
import StatsCards from '@/components/StatsCards';
import CapitalChart from '@/components/CapitalChart';
import AssetChart from '@/components/AssetChart';
import OperationHistory from '@/components/OperationHistory';

interface Operation {
  id: number;
  date: string;
  wins: number;
  losses: number;
  balance: number;
  asset_type: string;
  asset_name: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loadingOps, setLoadingOps] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await client.auth.me();
      if (res?.data) {
        setUser(res.data);
      }
    } catch {
      // Not logged in
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchOperations = useCallback(async () => {
    if (!user) return;
    setLoadingOps(true);
    try {
      const res = await client.entities.operations.query({
        query: {},
        sort: '-date',
        limit: 500,
      });
      setOperations(res?.data?.items || []);
    } catch (error) {
      console.error('Error fetching operations:', error);
    } finally {
      setLoadingOps(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchOperations();
    }
  }, [user, fetchOperations]);

  const handleLogin = () => {
    client.auth.toLogin();
  };

  const handleLogout = async () => {
    await client.auth.logout();
    setUser(null);
    setOperations([]);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-primary/10">
              <BarChart3 className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Day Trade Dashboard</h1>
          <p className="text-muted-foreground">
            Registre suas operações, acompanhe sua progressão de capital e descubra qual ativo você mais acerta.
          </p>
          <Button onClick={handleLogin} size="lg" className="cursor-pointer gap-2">
            <LogIn className="h-4 w-4" />
            Entrar para começar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold">Day Trade Dashboard</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="cursor-pointer gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stop Calculator */}
        <StopCalculator />

        {/* Operation Form */}
        <OperationForm onSuccess={fetchOperations} />

        {/* Stats Cards */}
        <StatsCards operations={operations} />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CapitalChart operations={operations} />
          <AssetChart operations={operations} />
        </div>

        {/* History */}
        <OperationHistory operations={operations} onRefresh={fetchOperations} />
      </main>
    </div>
  );
}
