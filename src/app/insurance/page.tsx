'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Shield, AlertCircle, CheckCircle, Clock, Download, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { COLORS, SHADOWS, BORDER_RADIUS } from '@/lib/design-tokens';
import { createInsurancePolicy, deleteInsurancePolicy } from '@/app/actions/insurance';
import type { InsurancePolicy } from '@/app/actions/insurance';

interface InsurancePolicyState extends InsurancePolicy {}

export default function InsurancePage() {
  const [policies, setPolicies] = useState<InsurancePolicyState[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    provider: '',
    policyNumber: '',
    startDate: '',
    expiryDate: '',
    coverage: '',
    document: null as File | null,
  });

  const activePolicies = policies.filter(p => p.verification_status === 'verified' && new Date(p.expiry_date) > new Date());
  const expiredPolicies = policies.filter(p => new Date(p.expiry_date) <= new Date());
  const pendingPolicies = policies.filter(p => p.verification_status === 'pending');

  const totalActiveCoverage = activePolicies.reduce((sum, p) => sum + (p.coverage_amount || 0), 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file: File | null) => {
    setFormData(prev => ({ ...prev, document: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.provider || !formData.policyNumber || !formData.coverage || !formData.document || !formData.expiryDate) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const form = new FormData();
      form.append('provider', formData.provider);
      form.append('policyNumber', formData.policyNumber);
      form.append('startDate', formData.startDate || new Date().toISOString().split('T')[0]);
      form.append('expiryDate', formData.expiryDate);
      form.append('coverageAmount', formData.coverage);
      form.append('certificateFile', formData.document);

      await createInsurancePolicy(form);

      setSuccessMessage('Policy uploaded successfully! Pending verification.');
      setFormData({ provider: '', policyNumber: '', startDate: '', expiryDate: '', coverage: '', document: null });
      setShowUploadForm(false);
      
      // Reload policies
      // In a real app, use useTransition or refetch
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to upload policy';
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (policyId: string) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) {
      return;
    }

    try {
      await deleteInsurancePolicy(policyId);
      setPolicies(policies.filter(p => p.id !== policyId));
      setSuccessMessage('Policy deleted successfully');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete policy';
      setErrorMessage(errorMsg);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5" style={{ color: COLORS['trust-green'] }} />;
      case 'pending':
        return <Clock className="w-5 h-5" style={{ color: COLORS['energy-orange'] }} />;
      case 'expired':
        return <AlertCircle className="w-5 h-5" style={{ color: '#EF4444' }} />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5" style={{ color: '#DC2626' }} />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'verified':
        return 'default';
      case 'pending':
        return 'default';
      case 'expired':
        return 'destructive';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return COLORS['trust-green'];
      case 'pending':
        return COLORS['energy-orange'];
      case 'expired':
        return '#EF4444';
      case 'rejected':
        return '#DC2626';
      default:
        return COLORS['text-muted'];
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <main style={{ backgroundColor: COLORS['bg-light'], minHeight: '100vh' }} className="px-4 py-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        {/* Success Message */}
        {successMessage && (
          <div style={{ backgroundColor: COLORS['trust-green'] + '15', borderLeft: `4px solid ${COLORS['trust-green']}`, color: COLORS['trust-green'] }} className="p-4 rounded mb-6 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div style={{ backgroundColor: '#FEE2E2', borderLeft: '4px solid #DC2626', color: '#DC2626' }} className="p-4 rounded mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <Link href="/pro-dashboard" className="inline-flex items-center gap-2 mb-4" style={{ color: COLORS['energy-orange'] }}>
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: COLORS['text-dark'] }}>
                Professional Insurance
              </h1>
              <p className="text-lg" style={{ color: COLORS['text-muted'] }}>
                Manage your liability insurance and professional coverage
              </p>
            </div>
            <Shield className="w-12 h-12" style={{ color: COLORS['trust-green'] }} />
          </div>
        </div>

        {/* Coverage Overview */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card style={{ boxShadow: SHADOWS.md, backgroundColor: 'white' }}>
            <CardContent className="pt-6">
              <p className="text-sm" style={{ color: COLORS['text-muted'] }}>
                Active Policies
              </p>
              <p className="text-3xl font-bold mt-2" style={{ color: COLORS['trust-green'] }}>
                {activePolicies.length}
              </p>
            </CardContent>
          </Card>

          <Card style={{ boxShadow: SHADOWS.md, backgroundColor: 'white' }}>
            <CardContent className="pt-6">
              <p className="text-sm" style={{ color: COLORS['text-muted'] }}>
                Total Coverage
              </p>
              <p className="text-3xl font-bold mt-2" style={{ color: COLORS['energy-orange'] }}>
                KSh {(totalActiveCoverage / 1000).toFixed(0)}K
              </p>
            </CardContent>
          </Card>

          <Card style={{ boxShadow: SHADOWS.md, backgroundColor: 'white' }}>
            <CardContent className="pt-6">
              <p className="text-sm" style={{ color: COLORS['text-muted'] }}>
                Pending Verification
              </p>
              <p className="text-3xl font-bold mt-2" style={{ color: COLORS['energy-orange'] }}>
                {pendingPolicies.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upload New Certificate */}
        <Card style={{ boxShadow: SHADOWS.md, backgroundColor: 'white' }} className="mb-8">
          <CardHeader style={{ borderBottom: `1px solid ${COLORS['border-light']}` }}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle style={{ color: COLORS['text-dark'] }}>
                  {showUploadForm ? 'Upload Insurance Certificate' : 'Add New Policy'}
                </CardTitle>
                <CardDescription style={{ color: COLORS['text-muted'] }}>
                  Upload your insurance certificate for verification
                </CardDescription>
              </div>
              {!showUploadForm && (
                <Button 
                  onClick={() => setShowUploadForm(true)}
                  className="text-white"
                  style={{ backgroundColor: COLORS['trust-green'] }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Certificate
                </Button>
              )}
            </div>
          </CardHeader>

          {showUploadForm && (
            <CardContent className="pt-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium" style={{ color: COLORS['text-dark'] }}>
                    Insurance Provider
                  </label>
                  <Input
                    type="text"
                    name="provider"
                    placeholder="e.g., Heritage Insurance"
                    value={formData.provider}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium" style={{ color: COLORS['text-dark'] }}>
                    Policy Number
                  </label>
                  <Input
                    type="text"
                    name="policyNumber"
                    placeholder="POL-2024-001234"
                    value={formData.policyNumber}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium" style={{ color: COLORS['text-dark'] }}>
                    Start Date
                  </label>
                  <Input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium" style={{ color: COLORS['text-dark'] }}>
                    Expiry Date *
                  </label>
                  <Input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="mt-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium" style={{ color: COLORS['text-dark'] }}>
                  Coverage Amount (KSh) *
                </label>
                <Input
                  type="number"
                  name="coverage"
                  placeholder="e.g., 500000"
                  value={formData.coverage}
                  onChange={handleInputChange}
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium" style={{ color: COLORS['text-dark'] }}>
                  Certificate PDF File *
                </label>
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  className="mt-2"
                  required
                />
                {formData.document && (
                  <p className="text-sm mt-2" style={{ color: COLORS['trust-green'] }}>
                    ✓ {formData.document.name}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSubmit}
                  className="text-white flex-1"
                  style={{ backgroundColor: COLORS['trust-green'] }}
                >
                  Upload Certificate
                </Button>
                <Button
                  onClick={() => {
                    setShowUploadForm(false);
                    setFormData({ provider: '', policyNumber: '', startDate: '', expiryDate: '', coverage: '', document: null });
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Active Policies */}
        {activePolicies.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS['text-dark'] }}>
              Active Policies
            </h2>
            <div className="space-y-4">
              {activePolicies.map(policy => (
                <Card key={policy.id} style={{ boxShadow: SHADOWS.md, backgroundColor: 'white' }}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold" style={{ color: COLORS['text-dark'] }}>
                            {policy.provider}
                          </h3>
                          <Badge 
                            variant={getStatusBadgeVariant(policy.verification_status)}
                            style={{ backgroundColor: getStatusColor(policy.verification_status) }}
                          >
                            {policy.verification_status.charAt(0).toUpperCase() + policy.verification_status.slice(1)}
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-xs" style={{ color: COLORS['text-muted'] }}>Policy Number</p>
                            <p className="font-mono font-semibold" style={{ color: COLORS['text-dark'] }}>{policy.policy_number}</p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: COLORS['text-muted'] }}>Coverage Amount</p>
                            <p className="font-semibold text-lg" style={{ color: COLORS['trust-green'] }}>
                              KSh {policy.coverage_amount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: COLORS['text-muted'] }}>Valid From</p>
                            <p className="text-sm" style={{ color: COLORS['text-dark'] }}>{formatDate(policy.start_date)}</p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: COLORS['text-muted'] }}>Expires</p>
                            <p className="text-sm" style={{ color: COLORS['text-dark'] }}>{formatDate(policy.expiry_date)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" asChild>
                          <a href={policy.certificate_url} download>
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </a>
                        </Button>
                        <Button variant="outline" className="text-red-600" onClick={() => handleDelete(policy.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Pending Policies */}
        {pendingPolicies.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS['text-dark'] }}>
              Under Review
            </h2>
            <div className="space-y-4">
              {pendingPolicies.map(policy => (
                <Card key={policy.id} style={{ boxShadow: SHADOWS.md, backgroundColor: 'white', borderLeft: `4px solid ${COLORS['energy-orange']}` }}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold" style={{ color: COLORS['text-dark'] }}>
                            {policy.provider}
                          </h3>
                          <Badge style={{ backgroundColor: COLORS['energy-orange'] }}>Pending</Badge>
                        </div>
                        <p className="text-sm" style={{ color: COLORS['text-muted'] }}>
                          Uploaded {formatDate(policy.uploaded_at)} - We'll verify your certificate within 24-48 hours
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Expired Policies */}
        {expiredPolicies.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS['text-dark'] }}>
              Expired Policies
            </h2>
            <div className="space-y-4">
              {expiredPolicies.map(policy => (
                <Card key={policy.id} style={{ boxShadow: SHADOWS.md, backgroundColor: COLORS['bg-light'] }}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold" style={{ color: COLORS['text-dark'] }}>
                          {policy.provider}
                        </h3>
                        <p className="text-sm mt-1" style={{ color: COLORS['text-muted'] }}>
                          Expired on {formatDate(policy.expiry_date)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {policies.length === 0 && (
          <Card style={{ boxShadow: SHADOWS.md, backgroundColor: 'white' }} className="text-center py-12">
            <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: COLORS['text-muted'] }} />
            <h3 className="text-xl font-bold mb-2" style={{ color: COLORS['text-dark'] }}>
              No Insurance Policies Yet
            </h3>
            <p className="text-sm mb-6" style={{ color: COLORS['text-muted'] }}>
              Upload your professional insurance certificate to build trust with clients
            </p>
            <Button
              onClick={() => setShowUploadForm(true)}
              className="text-white"
              style={{ backgroundColor: COLORS['trust-green'] }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Add Your First Policy
            </Button>
          </Card>
        )}
      </div>
    </main>
  );
}
