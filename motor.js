(function(root){
  'use strict';
  function calcular(p,points){
    for(const key of ['lm','lambda','sm','rhom','num','rhos','nus','g']){
      if(!Number.isFinite(p[key])||p[key]<=0)throw new Error('O parâmetro '+key+' deve ser um número positivo.');
    }
    if(!Number.isFinite(p.k)||p.k<0)throw new Error('O fator de forma k deve ser maior ou igual a zero.');
    if(!Array.isArray(points)||!points.length)throw new Error('Forneça pelo menos um par Vm e RTm.');
    const ls=p.lm*p.lambda,ss=p.sm*p.lambda**2;
    const rows=points.map(([vm,rtm],i)=>{
      if(!Number.isFinite(vm)||!Number.isFinite(rtm)||vm<=0||rtm<=0)throw new Error('Linha '+(i+1)+': Vm e RTm devem ser positivos.');
      const fn=vm/Math.sqrt(p.g*p.lm),vs=vm*Math.sqrt(p.lambda),kn=vs*3600/1852;
      const rem=vm*p.lm/p.num,res=vs*ls/p.nus;
      if(rem<=100||res<=100)throw new Error('Linha '+(i+1)+': Reynolds fora do domínio usado para a curva ITTC-1957.');
      const ctm=rtm/(.5*p.rhom*p.sm*vm**2),cfm=.075/(Math.log10(rem)-2)**2,cfs=.075/(Math.log10(res)-2)**2;
      const cr=ctm-cfm,cw=ctm-(1+p.k)*cfm,ctf=cr+cfs,cth=cw+(1+p.k)*cfs;
      const rtf=ctf*.5*p.rhos*ss*vs**2/1000,rth=cth*.5*p.rhos*ss*vs**2/1000;
      const pef=rtf*vs,peh=rth*vs;
      const warnings=[];
      if(rem<5e5||res<5e5)warnings.push('Reynolds baixo: revisar hipótese de escoamento turbulento.');
      if(cw<0)warnings.push('CW negativo: revisar RTm, área e fator de forma.');
      if(rtf<=0||rth<=0)warnings.push('Resistência extrapolada não positiva: revisar entradas.');
      const r={vm,rtm,fn,vs,kn,rem,res,ctm,cfm,cfs,cr,cw,ctf,cth,rtf,rth,pef,peh,warnings};
      for(const [key,value] of Object.entries(r))if(typeof value==='number'&&!Number.isFinite(value))throw new Error('Resultado fora da faixa numérica: '+key+'.');
      return r;
    });
    return {ls,ss,rows};
  }
  root.Extrapolacao={calcular};
  if(typeof module!=='undefined')module.exports=root.Extrapolacao;
})(typeof globalThis!=='undefined'?globalThis:window);
