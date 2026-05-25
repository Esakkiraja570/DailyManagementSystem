import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Newspaper, LogIn, UserPlus, Phone, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { npPost } from './npApi';

const inp = { width:'100%',height:44,padding:'0 14px',borderRadius:10,border:'1.5px solid #e2e8f0',fontSize:14,outline:'none',background:'#f8fafc',boxSizing:'border-box' };

const NewspaperAuth = () => {
  const navigate = useNavigate();
  const { role } = useParams();
  const [tab, setTab]   = useState('login');

  useEffect(() => {
    if (role === 'customer') {
      navigate('/distributor/customer', { replace: true });
    }
  }, [role, navigate]);
  const [loading, setL] = useState(false);
  const [error, setErr] = useState('');
  const [f, setF] = useState({ name:'', mobile:'', password:'', businessName:'', area:'' });

  const ch = (e) => {
    const { name, value } = e.target;
    setF(p => ({ ...p, [name]: name==='mobile' ? value.replace(/\D/g,'').slice(0,10) : value }));
  };

  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (!f.mobile || f.mobile.length!==10) return setErr('Enter valid 10-digit mobile');
    if (!f.password || f.password.length<4)  return setErr('Password min 4 characters');
    if (tab==='register' && !f.name.trim())  return setErr('Enter your name');
    setL(true);
    try {
      const res = await npPost(tab==='login' ? '/login' : '/register',
        tab==='login'
          ? { mobile:f.mobile, password:f.password }
          : { name:f.name.trim(), mobile:f.mobile, password:f.password, businessName:f.businessName, area:f.area }
      );
      localStorage.setItem('npToken',  res.token||'');
      localStorage.setItem('npMobile', f.mobile);
      localStorage.setItem('npData',   JSON.stringify(res));
      navigate('/distributor/admin');
    } catch(err) { setErr(err.message||'Auth failed'); }
    finally      { setL(false); }
  };

  return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#0f172a,#1e3a5f,#0f172a)' }}>
      <div style={{ background:'#fff',borderRadius:24,padding:'40px 36px',width:'100%',maxWidth:440,boxShadow:'0 32px 80px rgba(0,0,0,.4)' }}>

        <button onClick={()=>navigate(-1)} style={{ background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:6,color:'#64748b',fontWeight:600,fontSize:13,marginBottom:20,padding:0 }}>
          <ArrowLeft size={16}/> Back
        </button>

        <div style={{ textAlign:'center',marginBottom:24 }}>
          <div style={{ width:60,height:60,borderRadius:18,background:'linear-gradient(135deg,#1e40af,#3b82f6)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',boxShadow:'0 8px 20px rgba(37,99,235,.4)' }}>
            <Newspaper size={28} color="#fff"/>
          </div>
          <h2 style={{ fontWeight:900,fontSize:22,margin:'0 0 4px' }}>Newspaper Distributor</h2>
          <p style={{ color:'#64748b',fontSize:13,margin:0 }}>Route Management Portal</p>
        </div>

        <div style={{ display:'flex',background:'#f1f5f9',borderRadius:12,padding:4,marginBottom:20 }}>
          {[['login','Login',LogIn],['register','Register',UserPlus]].map(([val,lbl,Icon])=>(
            <button key={val} onClick={()=>{setTab(val);setErr('');}} style={{ flex:1,padding:'10px 0',borderRadius:9,border:'none',fontWeight:700,fontSize:14,cursor:'pointer',background:tab===val?'#fff':'transparent',color:tab===val?'#1e40af':'#64748b',boxShadow:tab===val?'0 2px 8px rgba(0,0,0,.08)':'none',display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>
              <Icon size={14}/>{lbl}
            </button>
          ))}
        </div>

        {error && <div style={{ background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,padding:'10px 14px',color:'#dc2626',fontSize:13,fontWeight:600,marginBottom:14 }}>{error}</div>}

        <form onSubmit={submit} style={{ display:'flex',flexDirection:'column',gap:12 }}>
          {tab==='register' && <>
            <input name="name" value={f.name} onChange={ch} placeholder="Full Name *" required style={inp}/>
            <input name="businessName" value={f.businessName} onChange={ch} placeholder="Business Name (optional)" style={inp}/>
            <input name="area" value={f.area} onChange={ch} placeholder="Area / Zone (optional)" style={inp}/>
          </>}

          <div style={{ position:'relative' }}>
            <Phone size={15} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#94a3b8' }}/>
            <input name="mobile" value={f.mobile} onChange={ch} type="tel" maxLength={10} placeholder="Mobile Number *" required style={{ ...inp,paddingLeft:36 }}/>
          </div>
          <div style={{ position:'relative' }}>
            <Lock size={15} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#94a3b8' }}/>
            <input name="password" value={f.password} onChange={ch} type="password" placeholder="Password *" required style={{ ...inp,paddingLeft:36 }}/>
          </div>

          <button type="submit" disabled={loading} style={{ height:48,borderRadius:12,border:'none',cursor:'pointer',background:loading?'#94a3b8':'linear-gradient(135deg,#1e40af,#3b82f6)',color:'#fff',fontWeight:800,fontSize:15,display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:4 }}>
            {loading ? <><Loader2 size={18} style={{ animation:'spin 1s linear infinite' }}/> Please wait...</> : tab==='login' ? 'Open Dashboard' : 'Create Account'}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};
export default NewspaperAuth;
