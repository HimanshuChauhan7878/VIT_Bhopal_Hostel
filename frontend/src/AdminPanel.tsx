import React, { useState } from 'react';
import * as XLSX from "xlsx";

// Fixed list of room types from App.tsx
const ROOM_TYPES = [
  'Premium-4- Bedded Bunk Non AC Rooms-4-₹1,50,000/year',
  'Premium-4- Bedded Flat Non AC Rooms-4-₹1,50,000/year',
  'Normal-4- Bedded Bunk Non AC Rooms-4-₹1,50,000/year',
  'Normal-4- Bedded Flat Non AC Rooms-4-₹1,50,000/year',
  'Normal-6- Bedded Bunk Non AC Rooms-6-₹1,50,000/year',
  'Normal-6- Bedded Bunk AC Rooms-6-₹1,50,000/year',
  'Normal-4- Bedded Bunk AC Rooms-4-₹1,50,000/year',
  'Premium-4- Bedded Bunk AC Rooms-4-₹1,50,000/year',
  'Premium-4- Bedded Flat AC Rooms-4-₹1,50,000/year',
  'Normal-3- Bedded Bunk Non AC Rooms-3-₹1,50,000/year',
  'Normal-3- Bedded Flat Non AC Rooms-3-₹1,50,000/year',
  'Premium-3- Bedded Flat Non AC Rooms-3-₹1,50,000/year',
  'Premium-3- Bedded Flat AC Rooms-3-₹1,50,000/year',
  'Normal-3- Bedded Flat AC Rooms-3-₹1,50,000/year',
  'Normal-2- Bedded Bunk Non AC Rooms-2-₹1,50,000/year',
  'Normal-2- Bedded Flat Non AC Rooms-2-₹1,50,000/year',
  'Premium-2- Bedded Flat Non AC Rooms-2-₹1,50,000/year',
  'Normal-2- Bedded Flat AC Rooms-2-₹1,50,000/year',
  'Premium-2- Bedded Flat AC Rooms-2-₹1,50,000/year',
];

interface RoomAvailability {
  [roomType: string]: number;
}

interface AllotmentResult {
  groupId: string;
  leaderRegNo: string;
  avgRank: number;
  allottedRoom: string | null;
  memberRegNos: string[];
}

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [availability, setAvailability] = useState<RoomAvailability>(
    Object.fromEntries(ROOM_TYPES.map((type) => [type, 0]))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [allotment, setAllotment] = useState<AllotmentResult[]>([]);

  const handleAvailabilityChange = (type: string, value: number) => {
    setAvailability((prev) => ({ ...prev, [type]: value }));
  };

  const handleAllotment = async () => {
    setError(null);
    setSuccess(null);
    setAllotment([]);
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/groups/allotment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability }),
      });
      if (!response.ok) throw new Error('Allotment failed');
      const result = await response.json();
      setAllotment(result.allotment);
      setSuccess('Room allotment completed successfully!');
    } catch (err) {
      setError('Room allotment failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = () => {
    if (allotment.length === 0) return;
    const wsData = [
      ["Group ID", "Leader Reg. No", "Avg. Rank", "Allotted Room", "Members"],
      ...allotment.map(row => [
        row.groupId,
        row.leaderRegNo,
        row.avgRank,
        row.allottedRoom || 'None',
        row.memberRegNos.join(', ')
      ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Allotment");
    XLSX.writeFile(wb, "RoomAllotment.xlsx");
  };

  return (
    <div className="relative max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-10">
      <h2 className="text-2xl font-bold mb-6">Admin Room Allotment Panel</h2>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAllotment();
        }}
      >
        <table className="min-w-full mb-6">
          <thead>
            <tr>
              <th className="text-left py-2">Room Type</th>
              <th className="text-left py-2">No. of Rooms Available</th>
            </tr>
          </thead>
          <tbody>
            {ROOM_TYPES.map((type) => (
              <tr key={type}>
                <td className="py-2 pr-4">{type}</td>
                <td className="py-2">
                  <input
                    type="number"
                    min={0}
                    value={availability[type]}
                    onChange={(e) => handleAvailabilityChange(type, Number(e.target.value))}
                    className="border px-2 py-1 rounded w-24"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Running Allotment...' : 'Run Allotment'}
        </button>
      </form>
      {allotment.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Final Room Allotment</h3>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left py-2">Group ID</th>
                <th className="text-left py-2">Leader Reg. No</th>
                <th className="text-left py-2">Avg. Rank</th>
                <th className="text-left py-2">Allotted Room</th>
                <th className="text-left py-2">Members</th>
              </tr>
            </thead>
            <tbody>
              {allotment.map((row) => (
                <tr key={row.groupId}>
                  <td className="py-2 pr-4">{row.groupId}</td>
                  <td className="py-2 pr-4">{row.leaderRegNo}</td>
                  <td className="py-2 pr-4">{row.avgRank}</td>
                  <td className="py-2 pr-4">{row.allottedRoom || 'None'}</td>
                  <td className="py-2">{row.memberRegNos.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={handleDownloadExcel}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
          >
            Download as Excel
          </button>
        </div>
      )}
      <div className="flex justify-start mt-8">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-200 text-slate-800 rounded hover:bg-slate-300 shadow"
        >
          ← Back
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
