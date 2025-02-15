import{r as m,h as P,j as s,D as v,P as f}from"./index-C3ctIiJl.js";import{B as x}from"./Box-FC9Y7n6T.js";import{T as q,a as M,b as W,c as D,d as n,e as L}from"./TableRow-BTX8zteK.js";import{P as O,I as $}from"./IconButton-Cmlk01-7.js";import{T as R}from"./TextField-hedXIXYF.js";import{D as H,F as Q,A as X}from"./Delete-BZ0mw7gd.js";const Z=({onChange:_,initialData:d})=>{const[t,i]=m.useState([]),[g,u]=m.useState([]),[F,b]=m.useState(null),[E,y]=m.useState(null),N=P(e=>e.userInfo),[h,G]=m.useState(N.whitelevel_id);m.useEffect(()=>{if(Array.isArray(d)&&d.length>0&&t.length===0){console.log("initialData :",d);const e=d.map(o=>({...o,employee_id:o.trainee_id||o.employee_id,employee_name:o.trainee_name||o.employee_name}));console.log("Updated Rows:",e),i(e)}},[d]);const I=async e=>{try{return(await v.post("/employee/name/",{employee_id:e,whitelevel_id:h})).data.employee_name||""}catch(o){return console.error("Error fetching employee name:",o),""}},S=async e=>{try{return(await v.get(`/employee/search/?nameQuery=${e}`)).data||[]}catch(o){return console.error("Error fetching employee suggestions:",o),[]}};m.useEffect(()=>{_(t.map(e=>({employee:e.employee_id,employee_id:e.employee_id,employee_name:e.employee_name,whitelevel_id:h,trainee_id:e.employee_id,trainee_name:e.employee_name})))},[t,_]);const T=()=>{if(t.some(l=>l.employee_id.trim()===""||l.employee_name.trim()==="")){alert("Please fill in all the fields before adding a new row.");const l=t.map(a=>({...a,error:a.employee_id.trim()===""||a.employee_name.trim()===""?"empty_field":a.error}));i(l),console.log("Updated rows after adding a row with empty fields:",l);return}const o=[...t,{employee_id:"",whitelevel_id:h,employee_name:"",error:null,disableNameField:!1}];i(o),console.log("Updated rows after adding a new row:",o)},w=e=>{const o=t.filter((l,a)=>a!==e);i(o),console.log("Updated rows after deleting a row:",o)},C=async(e,o)=>{const{name:l,value:a}=o.target,r=[...t];if(r[e][l]=a.trim(),l==="employee_id")if(r.some((p,c)=>p.employee_id===a&&c!==e))r[e].error="duplicate",r[e].employee_name="",r[e].disableNameField=!0;else if(a.trim()!==""){const p=await I(a);p?(r[e].employee_name=p,r[e].error=null,r[e].disableNameField=!0):(r[e].employee_name="",r[e].error="invalid",r[e].disableNameField=!0)}else r[e].employee_name="",r[e].error=null,r[e].disableNameField=!1;i(r),console.log("Updated rows after employee_id input change:",r)},A=async(e,o)=>{const l=o.target.value,a=[...t];if(/^[a-zA-Z\s.]*$/.test(l)){if(a[e].employee_name=l,l.trim()!=="")if(a.some((c,B)=>c.employee_name===l&&B!==e))a[e].error="duplicate_name",a[e].disableIDField=!0;else{const c=await S(l);u(c),y(e),a[e].disableIDField=!1}else u([]),y(null),a[e].disableIDField=!1;const j=await I(a[e].employee_id);l.trim()!==j?a[e].error="name_mismatch":a[e].error=null}else a[e].error="invalid_name";i(a),console.log("Updated rows after employee_name input change:",a)},k=(e,o)=>{const l=[...t];l.some(r=>r.employee_id===o.employee_id&&r!==l[e])?(l[e].error="duplicate",l[e].disableNameField=!0):(l[e].employee_id=o.employee_id,l[e].employee_name=o.employee_name,l[e].error=null,l[e].disableNameField=!0),i(l),u([]),y(null),console.log("Updated rows after suggestion click:",l)},U=e=>{b(e)},z=()=>{b(null)};return s.jsxs(x,{sx:{position:"relative",backgroundColor:"#FAF9F6"},children:[s.jsx(q,{component:O,sx:{border:"1px solid lightgrey",borderRadius:"8px",boxShadow:"none"},children:s.jsxs(M,{children:[s.jsx(W,{children:s.jsxs(D,{children:[s.jsx(n,{children:"Sl. No"}),s.jsx(n,{sx:{pl:12},children:"Employee ID"}),s.jsx(n,{sx:{pl:12},children:"Employee Name"}),s.jsx(n,{children:"Actions"})]})}),s.jsx(L,{children:t.map((e,o)=>s.jsxs(D,{children:[s.jsx(n,{children:o+1}),s.jsx(n,{children:s.jsx(R,{variant:"outlined",size:"small",name:"employee_id",value:e.employee_id,onChange:l=>C(o,l),fullWidth:!0,required:!0,error:!!e.error,helperText:e.error==="duplicate"?"Duplicate employee ID":e.error==="invalid"?"Employee does not exist":e.error==="empty_field"?"Employee ID should not be empty":"",disabled:e.disableIDField})}),s.jsxs(n,{children:[s.jsx(R,{variant:"outlined",size:"small",name:"employee_name",value:e.employee_name,onChange:l=>A(o,l),fullWidth:!0,required:!0,error:!!e.error,helperText:e.error==="invalid_name"?"Invalid characters. Only letters, spaces, and dots are allowed.":e.error==="name_mismatch"?"Incorrect name for the given Employee ID":e.error==="duplicate_name"?"Duplicate employee name":e.error==="empty_field"?"Employee Name should not be empty":"",disabled:e.disableNameField}),o===E&&g.length>0&&s.jsx("div",{style:{position:"absolute",zIndex:1e3,width:"100%",backgroundColor:"#fff",border:"1px solid lightgrey",borderRadius:"4px",boxShadow:"0px 4px 8px rgba(0,0,0,0.2)",marginTop:"4px"},children:g.map((l,a)=>s.jsx("div",{style:{padding:"8px",backgroundColor:F===a?"#f0f0f0":"#fff",cursor:"pointer"},onMouseEnter:()=>U(a),onMouseLeave:z,onClick:()=>k(o,l),children:l.employee_name},l.employee_id))})]}),s.jsx(n,{children:s.jsx($,{"aria-label":"delete",onClick:()=>w(o),children:s.jsx(H,{})})})]},o))})]})}),s.jsx(x,{mt:2,children:s.jsx(Q,{size:"small",color:"primary","aria-label":"add",onClick:T,sx:{position:"absolute",bottom:-18,left:"49%",transform:"translateX(-50%)",boxShadow:"none",zIndex:1},children:s.jsx(X,{})})})]})};Z.propTypes={onChange:f.func.isRequired,initialData:f.arrayOf(f.object).isRequired};export{Z as T};
