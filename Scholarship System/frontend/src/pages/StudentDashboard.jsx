import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = "https://scholarship-backend-qbkn.onrender.com";

const FALLBACK_SCHOLARSHIPS = [
  { scholarshipId: 1, course: "Computer Science", minPercentage: 85, maxIncome: 300000, baseAmount: 50, isDefencePriorityActive: true },
  { scholarshipId: 2, course: "BBA", minPercentage: 75, maxIncome: 350000, baseAmount: 40, isDefencePriorityActive: true },
  { scholarshipId: 3, course: "Architecture", minPercentage: 80, maxIncome: 350000, baseAmount: 55, isDefencePriorityActive: true },
];

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [scholarships, setScholarships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);

  const [selectedScholarship, setSelectedScholarship] = useState(null);

  const [applyFiles, setApplyFiles] = useState({
    marksheet: null,
    aadhaar: null,
    income: null,
    caste: null,
    defence: null
  });

  const [localMarks, setLocalMarks] = useState('');
  const [localIncome, setLocalIncome] = useState('');
  const [localCaste, setLocalCaste] = useState('GEN');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };

      const [sRes, aRes] = await Promise.all([
        axios.get(`${API_URL}/api/student/scholarships`, config),
        axios.get(`${API_URL}/api/student/my-applications/${user.userId}`, config)
      ]);

      setScholarships(sRes.data.length ? sRes.data : FALLBACK_SCHOLARSHIPS);
      setApplications(aRes.data);

    } catch (err) {
      console.error("FETCH ERROR:", err);
      setScholarships(FALLBACK_SCHOLARSHIPS);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append('studentId', user.userId);
    formData.append('scholarshipId', selectedScholarship.scholarshipId);
    formData.append('twelfthPercentage', localMarks);
    formData.append('familyIncome', localIncome);
    formData.append('caste', localCaste);

    // ✅ FIXED FILE KEYS
    if (applyFiles.marksheet) formData.append('marksheet', applyFiles.marksheet);
    if (applyFiles.aadhaar) formData.append('aadhaar', applyFiles.aadhaar);
    if (applyFiles.income) formData.append('incomeProof', applyFiles.income); // ✅ FIX
    if (applyFiles.caste) formData.append('casteCertificate', applyFiles.caste);
    if (applyFiles.defence) formData.append('defence', applyFiles.defence);

    try {
      await axios.post(`${API_URL}/api/student/apply`, formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert("✅ SUCCESS: Application submitted");

      setSelectedScholarship(null);
      setApplyFiles({
        marksheet: null,
        aadhaar: null,
        income: null,
        caste: null,
        defence: null
      });

      fetchData();

    } catch (err) {
      console.error("FULL ERROR:", err);

      const errorMsg =
        err.response?.data ||
        err.response?.data?.message ||
        err.message ||
        "Unknown error";

      alert("❌ FAILED: " + errorMsg);
    }
  };

  return (
    <div>
      <h1>Student Dashboard</h1>

      {scholarships.map(s => (
        <div key={s.scholarshipId}>
          <h3>{s.course}</h3>
          <button onClick={() => setSelectedScholarship(s)}>Apply</button>
        </div>
      ))}

      {selectedScholarship && (
        <form onSubmit={handleApply}>
          <input
            type="number"
            placeholder="Marks"
            value={localMarks}
            onChange={e => setLocalMarks(e.target.value)}
          />

          <input
            type="number"
            placeholder="Income"
            value={localIncome}
            onChange={e => setLocalIncome(e.target.value)}
          />

          <input type="file" onChange={e => setApplyFiles({ ...applyFiles, marksheet: e.target.files[0] })} />
          <input type="file" onChange={e => setApplyFiles({ ...applyFiles, aadhaar: e.target.files[0] })} />
          <input type="file" onChange={e => setApplyFiles({ ...applyFiles, income: e.target.files[0] })} />
          <input type="file" onChange={e => setApplyFiles({ ...applyFiles, caste: e.target.files[0] })} />
          <input type="file" onChange={e => setApplyFiles({ ...applyFiles, defence: e.target.files[0] })} />

          <button type="submit">Submit</button>
        </form>
      )}
    </div>
  );
};

export default StudentDashboard;