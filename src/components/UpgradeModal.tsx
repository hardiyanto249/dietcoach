"use client";

import { X, Check, Star } from "lucide-react";
import { useState, useEffect } from "react";

declare global {
    interface Window {
        snap: any;
    }
}

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load Midtrans Snap Script
        const script = document.createElement("script");
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "");
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handlePayment = async () => {
        setLoading(true);
        try {
            // 1. Get Snap Token from API
            const res = await fetch("/api/payment/charge", { method: "POST" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to initiate payment");

            // 2. Handle Mock Mode
            if (data.isMock) {
                const confirmMock = confirm("DEV MODE: Simulate successful payment?");
                if (confirmMock) {
                    const mockRes = await fetch("/api/payment/mock-success", { method: "POST" });
                    if (mockRes.ok) {
                        alert("Mock Payment Success! You are now Premium.");
                        onClose();
                        window.location.reload();
                    } else {
                        alert("Mock upgrade failed.");
                    }
                }
                return;
            }

            // 3. Open Snap Popup
            if (window.snap) {
                window.snap.pay(data.token, {
                    onSuccess: function (result: any) {
                        alert("Payment Success!");
                        onClose();
                        window.location.reload(); // Reload to update subscription status
                    },
                    onPending: function (result: any) {
                        alert("Payment Pending. Please complete payment.");
                        onClose();
                    },
                    onError: function (result: any) {
                        alert("Payment Failed.");
                        console.error(result);
                    },
                    onClose: function () {
                        alert("You closed the popup without finishing the payment");
                    }
                });
            } else {
                alert("Payment system not ready. Please try again.");
            }

        } catch (error) {
            console.error("Payment Error:", error);
            alert("Failed to start payment process.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '1.5rem',
                width: '90%',
                maxWidth: '450px',
                position: 'relative',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8'
                    }}
                >
                    <X size={24} />
                </button>

                <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    color: 'white',
                    boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.3)'
                }}>
                    <Star size={32} fill="white" />
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
                    Upgrade to Pro
                </h2>
                <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                    Unlock the full potential of your diet journey with AI-powered features.
                </p>

                <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                    <FeatureItem text="📸 AI Food Recognition (Snap & Log)" />
                    <FeatureItem text="📅 Google Calendar Sync" />
                    <FeatureItem text="∞ Unlimited AI Chat" />
                    <FeatureItem text="📊 Advanced Analytics" />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
                        Rp 29.900<span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 'normal' }}>/mo</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: '500', marginTop: '0.25rem' }}>
                        or Rp 299.000/year (Save 2 months!)
                    </div>
                </div>

                <button
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.75rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                        opacity: loading ? 0.7 : 1
                    }}
                    onClick={handlePayment}
                    disabled={loading}
                >
                    {loading ? "Processing..." : "Get Premium Now"}
                </button>
            </div>
        </div>
    );
}

function FeatureItem({ text }: { text: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{
                background: '#dcfce7',
                padding: '0.25rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Check size={14} color="#16a34a" strokeWidth={3} />
            </div>
            <span style={{ color: '#334155', fontWeight: '500' }}>{text}</span>
        </div>
    );
}
