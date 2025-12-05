/**
 * Component for displaying a list of remittances
 */

import { useState } from 'react';
import { RemittanceCard } from './RemittanceCard';
import { Remittance } from '../types/remittance';
import { Filter, Search, ChevronDown } from 'lucide-react';

interface RemittanceListProps {
  remittances: Remittance[];
  userPublicKey: string | null;
  isLoading?: boolean;
}

type FilterType = 'all' | 'active' | 'completed' | 'cancelled';
type SortType = 'newest' | 'oldest' | 'amount' | 'progress';

export function RemittanceList({
  remittances,
  userPublicKey,
  isLoading = false,
}: RemittanceListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Filter remittances
  const filteredRemittances = remittances.filter((remittance) => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesPurpose = remittance.purpose.toLowerCase().includes(search);
      const matchesId = remittance.id.toString().includes(search);
      const matchesCreator = remittance.creator.toLowerCase().includes(search);
      const matchesRecipient = remittance.recipient.toLowerCase().includes(search);

      if (!matchesPurpose && !matchesId && !matchesCreator && !matchesRecipient) {
        return false;
      }
    }

    // Status filter
    if (filter === 'active' && (remittance.isReleased || remittance.isCancelled)) {
      return false;
    }
    if (filter === 'completed' && !remittance.isReleased) {
      return false;
    }
    if (filter === 'cancelled' && !remittance.isCancelled) {
      return false;
    }

    return true;
  });

  // Sort remittances
  const sortedRemittances = [...filteredRemittances].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.createdAt - a.createdAt;
      case 'oldest':
        return a.createdAt - b.createdAt;
      case 'amount':
        return Number(BigInt(b.targetAmount) - BigInt(a.targetAmount));
      case 'progress': {
        const progressA =
          (Number(a.currentAmount) / Number(a.targetAmount)) * 100;
        const progressB =
          (Number(b.currentAmount) / Number(b.targetAmount)) * 100;
        return progressB - progressA;
      }
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ID, purpose, or address..."
                className="input pl-10"
              />
            </div>
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center gap-2 justify-center"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showFilters ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Filter options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid md:grid-cols-2 gap-4">
            {/* Status filter */}
            <div>
              <label className="label">Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="input"
              >
                <option value="all">All Remittances</option>
                <option value="active">Active Only</option>
                <option value="completed">Completed Only</option>
                <option value="cancelled">Cancelled Only</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="label">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="input"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount">Highest Amount</option>
                <option value="progress">Most Progress</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {sortedRemittances.length} of {remittances.length} remittances
      </div>

      {/* Remittances list */}
      {sortedRemittances.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-2">No remittances found</p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-primary-600 hover:text-primary-700 text-sm"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedRemittances.map((remittance) => (
            <RemittanceCard
              key={remittance.id}
              remittance={remittance}
              userPublicKey={userPublicKey}
            />
          ))}
        </div>
      )}
    </div>
  );
}
