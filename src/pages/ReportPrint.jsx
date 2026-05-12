import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function ReportPrint({ analysis }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = 'Report';
  }, [location]);

  useEffect(() => {
    if (!analysis) {
      navigate('/analyse');
      return;
    }
    setTimeout(() => window.print(), 300);
  }, [analysis, navigate]);

  if (!analysis) return null;

  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const biasRows = Object.entries(analysis.biases || {});
  const biasOrder = ['Panic Selling', 'FOMO Buying', 'Loss Aversion', 'Overtrading', 'Herd Behavior', 'Revenge Trading', 'Recency Bias', 'Overconfidence', 'Sector Concentration', 'Sunk Cost Fallacy', 'Calendar Effect', 'Information Overload', 'Disposition Effect'];
  const sortedBiases = biasOrder.filter(key => analysis.biases[key]).map(key => [key, analysis.biases[key]]);

  const getSeverityColor = (score) => {
    if (score >= 70) return '#ef4444';
    if (score >= 40) return '#f97316';
    return '#22c55e';
  };

  const getSeverityLabel = (score) => {
    if (score >= 70) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  };

  return (
    <div style={{
      fontFamily: 'Inter, system-ui, sans-serif',
      maxWidth: '900px',
      margin: '0 auto',
      padding: '40px',
      color: '#1a1a1a',
      lineHeight: 1.6,
      background: '#ffffff'
    }}>
      <div style={{
        borderBottom: '3px solid #E85D26',
        paddingBottom: '24px',
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <Brain size={32} style={{ color: '#E85D26' }} />
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            margin: 0,
            color: '#0d0d0d'
          }}>
            VRITTI BEHAVIOUR REPORT
          </h1>
        </div>
        <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>
          Generated on {today}
        </p>
        <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>
          Analysis Period: {analysis.analysisPeriod}
        </p>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #E85D26 0%, #ff6b35 100%)',
        color: 'white',
        padding: '32px',
        borderRadius: '12px',
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '14px', margin: '0 0 8px 0', opacity: 0.9 }}>
          YOUR BEHAVIOUR SCORE
        </p>
        <div style={{
          fontSize: '72px',
          fontWeight: '800',
          margin: '0',
          lineHeight: 1
        }}>
          {analysis.behaviourScore}
        </div>
        <p style={{ fontSize: '14px', margin: '8px 0 0 0', opacity: 0.9 }}>
          out of 100
        </p>
      </div>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          marginBottom: '20px',
          color: '#0d0d0d',
          borderBottom: '2px solid #e5e5e5',
          paddingBottom: '12px'
        }}>
          Bias Breakdown
        </h2>
        <div style={{
          display: 'grid',
          gap: '16px'
        }}>
          {sortedBiases.map(([key, bias]) => (
            <div key={key} style={{
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              padding: '20px',
              background: '#fafafa'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  margin: 0,
                  color: '#0d0d0d'
                }}>
                  {key}
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: getSeverityColor(bias.score)
                  }}>
                    {bias.score}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: getSeverityColor(bias.score),
                    color: 'white'
                  }}>
                    {getSeverityLabel(bias.score)}
                  </span>
                </div>
              </div>
              <p style={{
                fontSize: '14px',
                color: '#666',
                margin: '0',
                lineHeight: 1.5
              }}>
                {bias.description}
              </p>
              {bias.instances && bias.instances.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <p style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#666',
                    margin: '0 0 8px 0'
                  }}>
                    Affected Trades: {bias.instances.length}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          marginBottom: '20px',
          color: '#0d0d0d',
          borderBottom: '2px solid #e5e5e5',
          paddingBottom: '12px'
        }}>
          Top Nudges
        </h2>
        <div style={{
          display: 'grid',
          gap: '16px'
        }}>
          {(analysis.nudges || []).slice(0, 5).map((n, idx) => (
            <div key={idx} style={{
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              padding: '16px',
              background: '#fff',
              borderLeft: '4px solid #E85D26'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                {idx === 0 && <AlertTriangle size={20} style={{ color: '#E85D26', flexShrink: 0 }} />}
                {idx === 1 && <TrendingUp size={20} style={{ color: '#E85D26', flexShrink: 0 }} />}
                {idx === 2 && <Brain size={20} style={{ color: '#E85D26', flexShrink: 0 }} />}
                {idx === 3 && <CheckCircle size={20} style={{ color: '#E85D26', flexShrink: 0 }} />}
                {idx === 4 && <XCircle size={20} style={{ color: '#E85D26', flexShrink: 0 }} />}
                <div>
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    margin: '0 0 8px 0',
                    color: '#0d0d0d'
                  }}>
                    {n.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#666',
                    margin: '0',
                    lineHeight: 1.5
                  }}>
                    {n.evidence}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          marginBottom: '20px',
          color: '#0d0d0d',
          borderBottom: '2px solid #e5e5e5',
          paddingBottom: '12px'
        }}>
          Counterfactual Analysis
        </h2>
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          padding: '24px'
        }}>
          <p style={{
            fontSize: '15px',
            color: '#0c4a6e',
            margin: '0 0 16px 0',
            lineHeight: 1.6
          }}>
            {analysis.counterfactual?.narrative}
          </p>
          {analysis.counterfactual?.improvement && (
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '6px',
              border: '1px solid #bae6fd'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#666',
                margin: '0 0 8px 0'
              }}>
                If you had traded without these biases, your portfolio would be approximately:
              </p>
              <p style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#16a34a',
                margin: '0'
              }}>
                ₹{analysis.counterfactual.improvement.toLocaleString('en-IN')} better off
              </p>
              <p style={{
                fontSize: '12px',
                color: '#666',
                margin: '8px 0 0 0',
                fontStyle: 'italic'
              }}>
                This is a rules based replay, not a forecast of future performance.
              </p>
            </div>
          )}
        </div>
      </section>

      <footer style={{
        borderTop: '2px solid #e5e5e5',
        paddingTop: '24px',
        marginTop: '40px',
        textAlign: 'center',
        color: '#666',
        fontSize: '13px'
      }}>
        <p style={{ margin: '0 0 8px 0' }}>
          Generated by Vritti
        </p>
        <p style={{ margin: '0 0 8px 0' }}>
          Built by Tanmay Agarwal
        </p>
        <p style={{ margin: '0', fontStyle: 'italic' }}>
          This is not financial advice. For educational purposes only.
        </p>
      </footer>
    </div>
  );
}
