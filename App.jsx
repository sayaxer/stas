import React, { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Login from "./components/Login.jsx";
import Layout from "./components/Layout.jsx";
import ConfirmationDialog from "./components/ConfirmationDialog.jsx";
import { useAuth } from "./hooks/useAuth.js";
import { useData } from "./hooks/useData.js";
import { useCrud } from "./hooks/useCrud.js";
import { SECTIONS, ALL_SECTIONS } from "./constants/navigation.js";
import { DEAL_STAGES, ACTIVE_KEYS, VERTICALS, SERVICES, CLIENT_STATUS } from "./constants/deals.js";
import { SALES_PATH, QUAL, OBJECTIONS, PARTNERS } from "./constants/sales.js";
import { PLATFORMS, VERDICT } from "./constants/platforms.js";
import { STAGES, STATUS } from "./constants/journey.js";
import { FOLLOW_UP_DAYS, HOT_DAYS_THRESHOLD, HEALTHY_MARGIN_PERCENT, MIN_MARGIN_PERCENT } from "./constants/values.js";
import { money, daysSince, today, uid } from "./utils/formatters.js";
import { valOf, paidOf, dealFromDB, dealToDB, cliFromDB, cliToDB } from "./utils/dealHelpers.js";
import { saveRow, dropRow, updateSettings } from "./lib/supabaseQueries.js";
import toast from "react-hot-toast";

// CSS styles (moved from inline)
const css = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;}body{margin:0;}
.app,.login-wrap,.cc{--bg:#F5F6F8;--card:#FFF;--line:#E8EBEF;--line2:#DCE0E6;--txt:#101522;--mid:#5C6675;--dim:#98A1AE;--acc:#4F46E5;--acc-s:#EEEEFE;--ok:#16A34A;--ok-s:#E8F6EE;--ok-b:#BBE4C9;--warn:#D97706;--warn-s:#FCF2E4;--warn-b:#F0D7AE;--bad:#DC2626;--bad-s:#FCEDED;--bad-b:#F2C5C5;font-family:'Inter',-apple-system,sans-serif;color:var(--txt);}
button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit;}
input,select,textarea{font-family:inherit;}
.spin{animation:spin 1s linear infinite;}@keyframes spin{to{transform:rotate(360deg);}}
.cc{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);color:var(--acc);gap:12px;flex-direction:column;}
.cc.tall{min-height:60vh;}.cc-t{font-size:13px;color:var(--mid);}
.main{max-width:680px;margin:0 auto;padding:0 16px;}
.ahead{position:sticky;top:60px;z-index:10;background:var(--bg);padding:16px 0 10px;}
.atitle{display:flex;align-items:center;gap:9px;font-size:22px;font-weight:700;}.atitle svg{color:var(--acc);}
.pills{display:flex;gap:7px;margin-top:12px;overflow-x:auto;padding-bottom:2px;scrollbar-width:none;}.pills::-webkit-scrollbar{display:none;}
.pill{padding:7px 14px;border-radius:99px;background:var(--card);border:1px solid var(--line);font-size:13px;font-weight:500;color:var(--mid);white-space:nowrap;}.pill.on{background:var(--txt);color:#fff;border-color:var(--txt);}
.content{padding:6px 0 28px;}
.panel{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 17px;margin-bottom:13px;box-shadow:0 1px 2px rgba(16,24,40,.03);}
.ph{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--mid);text-transform:uppercase;margin-bottom:13px;}.ph svg{color:var(--acc);}
.ph .ml{margin-left:auto;text-transform:none;}
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-bottom:13px;}
.mc{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:13px;box-shadow:0 1px 2px rgba(16,24,40,.03);}
.mc span{font-size:11px;color:var(--mid);display:block;}.mc b{font-size:19px;font-weight:700;margin-top:5px;display:block;}.ok{color:var(--ok);}.bad{color:var(--bad);}
.note{display:flex;gap:10px;padding:13px 14px;border-radius:13px;background:var(--warn-s);border:1px solid var(--warn-b);font-size:13px;line-height:1.5;margin-bottom:13px;}.note svg{color:var(--warn);flex-shrink:0;margin-top:1px;}.note b{font-weight:600;}.note.tip{background:var(--acc-s);border-color:#DADBFB;}.note.tip svg{color:var(--acc);}
.bar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px;}
.stats{display:flex;gap:8px;flex-wrap:wrap;}.stat{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:9px 13px;min-width:84px;}.stat b{font-size:16px;font-weight:700;display:block;}.stat span{font-size:11px;color:var(--mid);}
.lede{font-size:13px;color:var(--mid);max-width:420px;line-height:1.5;}
.btn{display:inline-flex;align-items:center;gap:6px;padding:9px 15px;border-radius:11px;background:var(--acc);color:#fff;font-size:13.5px;font-weight:600;white-space:nowrap;box-shadow:0 2px 8px -2px rgba(79,70,229,.5);}.btn:hover{background:#4338CA;}.btn.ghost{background:var(--card);color:var(--txt);border:1px solid var(--line2);box-shadow:none;margin-top:11px;}
.mini{display:inline-flex;align-items:center;gap:4px;padding:7px 10px;border-radius:8px;background:var(--acc-s);color:var(--acc);font-size:12px;font-weight:600;white-space:nowrap;}.mini:hover{background:#E2E2FD;}.mini[disabled]{opacity:.5;}
.ml{margin-left:auto;}
.ovr{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;}.ov{background:var(--card);border:1px solid var(--line);border-radius:11px;padding:8px 11px;min-width:72px;}.ov-l{font-size:10px;color:var(--dim);display:block;}.ov b{font-size:16px;font-weight:700;}.ov-s{font-size:10.5px;color:var(--mid);}
.grp{margin-bottom:15px;}.grp-h{display:flex;align-items:center;gap:8px;font-size:11.5px;font-weight:600;text-transform:uppercase;color:var(--mid);margin-bottom:9px;}.grp-m{color:var(--dim);margin-left:auto;font-weight:500;}
.dot{width:8px;height:8px;border-radius:3px;}.s-lead{background:#94A1B0;}.s-qual{background:#5B9BD5;}.s-offer{background:var(--warn);}.s-work{background:var(--acc);}.s-review{background:#06B6D4;}.s-won{background:var(--ok);}.s-lost{background:var(--bad);}
.deal{background:var(--card);border:1px solid var(--line);border-radius:13px;margin-bottom:9px;box-shadow:0 1px 2px rgba(16,24,40,.03);overflow:hidden;}.deal.open{border-color:var(--line2);}
.deal-top{display:flex;align-items:flex-start;gap:10px;padding:13px;}.deal-main{flex:1;min-width:0;text-align:left;}
.deal-n{font-weight:600;font-size:15px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}.rico{color:var(--acc);}
.deal-cl{display:inline-flex;align-items:center;gap:3px;font-size:11px;font-weight:500;color:var(--acc);background:var(--acc-s);padding:2px 7px;border-radius:6px;}
.deal-t{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-top:6px;}
.chip{font-size:11px;padding:3px 8px;border-radius:7px;background:var(--bg);border:1px solid var(--line);color:var(--mid);}.chip.pdf{color:var(--acc);background:var(--acc-s);border-color:#DADBFB;}
.deal-v{font-size:13px;font-weight:700;}.deal-pd{font-size:11px;font-weight:600;color:var(--ok);}
.deal-d{font-size:11px;color:var(--mid);}.deal-d.od{color:var(--bad);font-weight:600;}.deal-d.hot{color:var(--warn);font-weight:600;}
.deal-next{display:flex;align-items:center;gap:5px;font-size:12.5px;color:var(--mid);margin-top:7px;}.deal-next svg{color:var(--acc);flex-shrink:0;}
.touch{display:inline-flex;align-items:center;gap:5px;padding:7px 11px;border-radius:9px;background:var(--ok-s);color:var(--ok);border:1px solid var(--ok-b);font-size:12px;font-weight:600;flex-shrink:0;white-space:nowrap;}
.sel{appearance:none;-webkit-appearance:none;background:var(--bg);border:1px solid var(--line2);color:var(--txt);font-size:12.5px;padding:8px 10px;border-radius:9px;cursor:pointer;}
.sel-st{flex-shrink:0;max-width:118px;color:var(--acc);font-weight:600;background:var(--acc-s);border-color:#DADBFB;}
.edit{padding:0 13px 14px;display:flex;flex-direction:column;gap:10px;border-top:1px solid var(--line);}
.fld{display:flex;flex-direction:column;gap:5px;margin-top:11px;}.fld>span{font-size:11px;color:var(--dim);font-weight:500;}
.fld2{display:flex;gap:10px;}.fld2 .fld{flex:1;min-width:0;}
.inp{background:var(--bg);border:1px solid var(--line2);color:var(--txt);font-size:13.5px;padding:9px 11px;border-radius:9px;width:100%;}.inp::placeholder{color:var(--dim);}
.ri{display:flex;gap:8px;align-items:center;}.ri .sel,.ri .inp{flex:1;}
.line{display:flex;gap:7px;align-items:center;margin-top:7px;}.line-s{flex:1;min-width:0;}.line-q{width:62px;text-align:center;}
.bal{display:flex;gap:14px;flex-wrap:wrap;font-size:12.5px;color:var(--mid);padding:10px 12px;background:var(--bg);border:1px solid var(--line);border-radius:10px;}.bal b{color:var(--txt);}
.ta{background:var(--bg);border:1px solid var(--line2);border-radius:9px;padding:10px 11px;font-size:13.5px;min-height:120px;resize:vertical;width:100%;line-height:1.5;color:var(--txt);}
.pdf-row{display:flex;gap:8px;align-items:center;}
.pdf-link{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:var(--acc);text-decoration:none;background:var(--acc-s);border:1px solid #DADBFB;padding:8px 12px;border-radius:9px;}
.up{cursor:pointer;}
.reg-foot{display:flex;gap:8px;align-items:center;}
.del{display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:8px;border:1px solid var(--bad-b);color:var(--bad);background:var(--bad-s);font-size:12px;font-weight:500;}
.del-x{color:var(--dim);padding:4px;}.del-x:hover{color:var(--bad);}
.empty{padding:26px;text-align:center;color:var(--dim);font-size:13.5px;border:1px dashed var(--line2);border-radius:13px;background:var(--card);}.empty.sm{padding:15px;font-size:12.5px;}
.regcat{margin-bottom:16px;}.regcat-h{font-size:12px;font-weight:700;text-transform:uppercase;color:var(--acc);margin:4px 0 10px;letter-spacing:.03em;}
.ed-row{display:flex;gap:10px;align-items:center;padding:9px 0;border-top:1px solid var(--line);flex-wrap:wrap;}.panel .ed-row:first-of-type{border-top:none;}
.er-name{flex:1;min-width:120px;}.er-nums{display:flex;gap:8px;align-items:center;}.er-nums label{font-size:10px;color:var(--dim);display:flex;flex-direction:column;gap:2px;}.er-n{width:60px;text-align:center;padding:7px 6px;}
.ed-col{padding:12px 0;border-top:1px solid var(--line);}.panel .ed-col:first-of-type{border-top:none;}.ed-col-h{display:flex;gap:8px;align-items:center;}
.m2row{display:flex;gap:11px;flex-wrap:wrap;}.m2{flex:1;min-width:150px;display:flex;flex-direction:column;gap:6px;padding:13px;border-radius:11px;background:var(--bg);border:1px solid var(--line);}.m2 span{font-size:12px;color:var(--mid);}.m2 i{font-size:11px;color:var(--dim);display:flex;align-items:center;gap:5px;}.m2 .big{font-size:25px;font-weight:700;color:var(--acc);}
.inp-mini{width:62px;padding:3px 6px;font-size:12px;}.inp-n{max-width:130px;font-size:17px;font-weight:700;}
.goalrow{display:flex;gap:12px;align-items:flex-start;}.goalbar{flex:1;padding-top:4px;}.gb-track{height:9px;border-radius:99px;background:var(--bg);border:1px solid var(--line);overflow:hidden;}.gb-fill{height:100%;background:linear-gradient(90deg,#6366F1,var(--acc));border-radius:99px;}.goalbar i{font-size:11.5px;color:var(--mid);display:block;margin-top:7px;}
.mbar{display:flex;align-items:center;gap:11px;margin-bottom:9px;}.mb-l{width:84px;font-size:12px;color:var(--mid);flex-shrink:0;}.mb-track{flex:1;height:8px;border-radius:99px;background:var(--bg);border:1px solid var(--line);overflow:hidden;}.mb-fill{height:100%;border-radius:99px;}.mb-v{font-size:11px;color:var(--mid);width:92px;text-align:right;flex-shrink:0;}
.calc{display:flex;flex-direction:column;gap:11px;}.co{padding:13px 14px;border-radius:12px;border:1px solid;}.co.ok{background:var(--ok-s);border-color:var(--ok-b);}.co.mid{background:var(--warn-s);border-color:var(--warn-b);}.co.bad{background:var(--bad-s);border-color:var(--bad-b);}
.co-m{display:flex;align-items:baseline;gap:10px;margin-bottom:9px;}.co-m b{font-size:23px;font-weight:700;}.co-m span{font-size:13px;color:var(--mid);font-weight:600;}.co.ok .co-m b{color:var(--ok);}.co.mid .co-m b{color:var(--warn);}.co.bad .co-m b{color:var(--bad);}
.co-bar{height:7px;border-radius:99px;background:rgba(0,0,0,.05);overflow:hidden;margin-bottom:8px;}.co-fill{height:100%;border-radius:99px;}.co-fill.ok{background:var(--ok);}.co-fill.mid{background:var(--warn);}.co-fill.bad{background:var(--bad);}.co i{font-size:12px;color:var(--mid);}
.srow{display:flex;gap:10px;padding:9px 0;border-top:1px solid var(--line);align-items:flex-start;}.panel .srow:first-of-type,.bl .srow:first-of-type{border-top:none;}
.rt{font-size:13.5px;line-height:1.5;}.rt.dim{color:var(--mid);}.rf{display:flex;gap:6px;font-size:12.5px;color:var(--mid);margin-top:5px;line-height:1.45;}.rf svg{color:var(--acc);flex-shrink:0;margin-top:3px;}.srow.dn .rt{color:var(--mid);}
.mk{width:19px;height:19px;border-radius:6px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;margin-top:1px;}.mk.ok{background:var(--ok-s);color:var(--ok);border:1px solid var(--ok-b);}.mk.bad{background:var(--bad-s);color:var(--bad);border:1px solid var(--bad-b);}.mk.dim{background:var(--bg);border:1px solid var(--line2);color:var(--dim);}
.box{width:20px;height:20px;border-radius:6px;border:1.5px solid var(--line2);flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;margin-top:1px;background:var(--card);}.box.on{background:var(--ok);border-color:var(--ok);}
.qual{display:flex;flex-wrap:wrap;gap:7px;}.q{font-size:12px;padding:6px 11px;border-radius:8px;background:var(--bg);border:1px solid var(--line2);color:var(--mid);}
.obj{padding:11px 0;border-top:1px solid var(--line);}.panel .obj:first-of-type{border-top:none;}.obj-q{font-size:13px;color:var(--bad);font-weight:500;}.obj-r{display:flex;gap:6px;font-size:12.5px;margin-top:6px;line-height:1.5;}.obj-r svg{color:var(--acc);flex-shrink:0;margin-top:3px;}
.pn-t{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px;}.pn-t b{font-size:15.5px;}.pn-now{font-size:13px;color:var(--mid);line-height:1.5;}.pn-k{font-size:10px;text-transform:uppercase;color:var(--dim);margin-right:8px;font-weight:600;}.pn-r{display:flex;gap:6px;font-size:13px;margin-top:9px;line-height:1.5;padding-top:9px;border-top:1px solid var(--line);}.pn-r svg{color:var(--acc);flex-shrink:0;margin-top:3px;}
.badge{font-size:11px;font-weight:600;padding:3px 9px;border-radius:99px;border:1px solid;white-space:nowrap;}.badge.ok{color:var(--ok);background:var(--ok-s);border-color:var(--ok-b);}.badge.bad{color:var(--bad);background:var(--bad-s);border-color:var(--bad-b);}.badge.mid{color:var(--warn);background:var(--warn-s);border-color:var(--warn-b);}.badge.acc{color:var(--acc);background:var(--acc-s);border-color:#DADBFB;}.badge.dim{color:var(--dim);background:var(--bg);border-color:var(--line2);}
.member{background:var(--card);border:1px solid var(--line);border-radius:13px;padding:14px;margin-bottom:10px;box-shadow:0 1px 2px rgba(16,24,40,.03);}.member.over{border-color:var(--bad-b);}
.mem-r{display:flex;align-items:center;gap:10px;}.mem-n{flex:1;font-weight:600;font-size:15px;background:transparent;border:none;padding:3px 0;}.mem-role{margin-top:6px;font-size:12.5px;background:transparent;border:none;color:var(--mid);padding:2px 0;}
.cap-top{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--mid);margin:12px 0 7px;gap:8px;flex-wrap:wrap;}.cap-e{display:inline-flex;align-items:center;gap:6px;color:var(--dim);font-size:11px;}.cap-in{width:52px;padding:5px 7px;font-size:12.5px;text-align:center;}
.track{height:8px;border-radius:99px;background:var(--bg);border:1px solid var(--line);overflow:hidden;}.fill{height:100%;border-radius:99px;}.fill.ok{background:var(--ok);}.fill.mid{background:var(--warn);}.fill.bad{background:var(--bad);}
.urow{display:flex;flex-direction:column;gap:8px;padding:11px 0;border-top:1px solid var(--line);}.panel .urow:first-of-type{border-top:none;}.urow-b{display:flex;gap:8px;align-items:center;}.urow-b .sel{flex:1;}
.role{padding:13px 0;border-top:1px solid var(--line);}.panel .role:first-of-type{border-top:none;}.role-h{display:flex;align-items:center;gap:8px;margin-bottom:9px;}.role-n{flex:1;font-weight:600;font-size:14.5px;background:transparent;border:none;}.acc{display:flex;flex-wrap:wrap;gap:6px;}.achip{display:inline-flex;align-items:center;gap:5px;padding:6px 11px;border-radius:8px;border:1px solid var(--line2);background:var(--bg);font-size:12px;color:var(--mid);}.achip.on{background:var(--acc-s);border-color:#C9CBFA;color:var(--acc);font-weight:600;}
.fu{display:flex;gap:11px;align-items:flex-start;padding:11px 0;border-top:1px solid var(--line);}.panel .fu:first-of-type{border-top:none;}.fu-d{width:8px;height:8px;border-radius:99px;background:var(--line2);margin-top:5px;flex-shrink:0;}.fu-d.bad{background:var(--bad);}.fu-d.hot{background:var(--warn);}.fu-d.acc{background:var(--acc);}.fu>div{flex:1;min-width:0;}.fu-m{font-size:11.5px;color:var(--dim);margin-top:3px;}.wk-ch{font-size:11px;color:var(--acc);margin-top:4px;}
.link-row{width:100%;display:flex;align-items:center;gap:12px;padding:12px 0;border-top:1px solid var(--line);text-align:left;}.panel .link-row:first-of-type{border-top:none;}.link-row>svg:first-child{color:var(--acc);flex-shrink:0;}.link-row div{flex:1;}.link-row b{font-size:14px;display:block;}.link-row span{font-size:12px;color:var(--mid);}.link-row>svg:last-child{color:var(--dim);}
.flow{margin-top:2px;}.st{display:grid;grid-template-columns:34px 1fr;gap:12px;}.rail{display:flex;flex-direction:column;align-items:center;}
.node{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid var(--line2);background:var(--card);}.node.ok{color:var(--ok);border-color:var(--ok-b);background:var(--ok-s);}.node.mid,.node.fix{color:var(--warn);border-color:var(--warn-b);background:var(--warn-s);}.node.bad{color:var(--bad);border-color:var(--bad-b);background:var(--bad-s);}.node.tune{color:var(--acc);border-color:#DADBFB;background:var(--acc-s);}.node.skip{color:var(--dim);border-color:var(--line2);background:var(--bg);}
.wire{flex:1;width:2px;min-height:22px;margin:3px 0;background:var(--line2);border-radius:2px;}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;margin-bottom:10px;box-shadow:0 1px 2px rgba(16,24,40,.03);overflow:hidden;}.st.open .card{border-color:var(--line2);}
.card-h{width:100%;display:flex;align-items:flex-start;gap:12px;padding:14px;text-align:left;}.ch-l{flex:1;min-width:0;}.ch-tag{font-size:10.5px;font-weight:600;letter-spacing:.1em;color:var(--acc);}.ch-n{font-weight:600;font-size:16px;margin-top:3px;}.ch-h{font-size:11px;color:var(--dim);margin-top:2px;}.ch-w{font-size:12.5px;color:var(--mid);margin-top:5px;line-height:1.45;}
.ch-r{display:flex;align-items:center;gap:9px;flex-shrink:0;}.verdict{font-size:10.5px;font-weight:600;padding:4px 9px;border-radius:99px;border:1px solid;white-space:nowrap;}.verdict.tune{color:var(--acc);background:var(--acc-s);border-color:#DADBFB;}.verdict.fix{color:var(--warn);background:var(--warn-s);border-color:var(--warn-b);}.verdict.skip{color:var(--dim);background:var(--bg);border-color:var(--line2);}
.chev{color:var(--dim);transition:transform .2s;}.st.open .chev{transform:rotate(180deg);}.card-b{padding:2px 14px 16px;}
.state{display:flex;gap:10px;padding:11px 12px;background:var(--bg);border:1px solid var(--line);border-radius:10px;margin-bottom:13px;font-size:13px;line-height:1.5;}.state-k{font-size:10px;text-transform:uppercase;color:var(--dim);font-weight:600;flex-shrink:0;padding-top:2px;}
.bl{margin-bottom:12px;}.bl:last-child{margin-bottom:0;}.bl-h{font-size:10.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:9px;}
input:focus,select:focus,textarea:focus,button:focus-visible{outline:2px solid var(--acc);outline-offset:1px;}
@media (max-width:560px){.cards{grid-template-columns:repeat(2,1fr);}.fld2{flex-direction:column;gap:0;}.atitle{font-size:20px;}.mb-l{width:66px;}.mb-v{width:78px;}.er-nums{width:100%;justify-content:space-between;}}
`;

function App() {
  const { session, ready, user, signIn, signUp, signOut } = useAuth();
  const { data, loading, updateData } = useData(session);
  
  const [section, setSection] = useState("home");
  const [sub, setSub] = useState("overview");
  const [expanded, setExpanded] = useState({});
  const [openDeal, setOpenDeal] = useState(null);
  const [openClient, setOpenClient] = useState(null);
  const [openReg, setOpenReg] = useState(null);
  const [calc, setCalc] = useState({ idx: 0, price: 45, cost: 22 });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", onConfirm: null });

  // Access control
  const myProfile = data.users.find((u) => u.id === session?.user?.id);
  const myRole = data.roles.find((r) => r.id === myProfile?.role);
  const access = myRole ? myRole.access || [] : ALL_SECTIONS;
  const visibleSections = SECTIONS.filter((s) => access.includes(s.key));

  useEffect(() => {
    if (!loading && session && !access.includes(section) && visibleSections.length) {
      const first = visibleSections[0];
      setSection(first.key);
      setSub(first.subs[0].k);
    }
  }, [loading, session, access, section, visibleSections]);

  const go = (sec) => {
    const s = SECTIONS.find((x) => x.key === sec);
    setSection(sec);
    setSub(s.subs[0].k);
  };

  const toggleExpand = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleDone = (id) => {
    const has = !!data.done[id];
    const newDone = { ...data.done };
    if (has) {
      delete newDone[id];
      dropRow("progress", id);
    } else {
      newDone[id] = true;
      saveRow("progress", { key: id, done: true });
    }
    updateData("done", newDone);
  };

  const showConfirm = (title, message, onConfirm) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm });
  };

  const hideConfirm = () => {
    setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null });
  };

  // Derived data
  const metrics = useMemo(() => {
    const act = data.deals.filter((d) => ACTIVE_KEYS.includes(d.stage));
    const won = data.deals.filter((d) => d.stage === "won");
    const lost = data.deals.filter((d) => d.stage === "lost");
    const cashIn = data.deals.filter((d) => d.stage !== "lost").reduce((a, d) => a + paidOf(d), 0);
    const receivable = data.deals.filter((d) => d.stage !== "lost").reduce((a, d) => a + Math.max(0, valOf(d) - paidOf(d)), 0);
    const pipeline = act.reduce((a, d) => a + valOf(d), 0);
    const wonSum = won.reduce((a, d) => a + valOf(d), 0);
    const conv = won.length + lost.length ? Math.round((won.length / (won.length + lost.length)) * 100) : 0;
    const avg = won.length ? Math.round(wonSum / won.length) : 0;
    const byStage = DEAL_STAGES.map((s) => {
      const list = data.deals.filter((d) => d.stage === s.key);
      return { ...s, count: list.length, sum: list.reduce((a, d) => a + valOf(d), 0) };
    });
    const maxSum = Math.max(1, ...byStage.map((s) => s.sum));
    return { actN: act.length, wonN: won.length, lostN: lost.length, cashIn, receivable, pipeline, conv, avg, byStage, maxSum };
  }, [data.deals]);

  const teamLoad = useMemo(() => {
    return data.team.map((mm) => {
      const l = data.deals.filter((d) => d.assignee === mm.id && ACTIVE_KEYS.includes(d.stage));
      return { ...mm, load: l.length, value: l.reduce((a, d) => a + valOf(d), 0), over: l.length > (+mm.capacity || 0) };
    });
  }, [data.team, data.deals]);

  const overdue = data.deals.filter((d) => ACTIVE_KEYS.includes(d.stage) && d.due && d.due < today());
  const hot = data.deals.filter((d) => ACTIVE_KEYS.includes(d.stage) && d.due && d.due >= today() && daysSince(d.due) >= -HOT_DAYS_THRESHOLD);
  const coldLeads = data.deals.filter((d) => d.stage === "lead");
  const reTouch = data.clients.filter((c) => (c.status === "active" || c.status === "repeat") && daysSince(c.lastContact) >= FOLLOW_UP_DAYS);
  const activeNext = data.deals.filter((d) => ACTIVE_KEYS.includes(d.stage) && d.next && d.next.trim()).sort((a, b) => ((a.due || "9999") < (b.due || "9999") ? -1 : 1));

  const front = [];
  PLATFORMS.forEach((p) => {
    if (p.verdict === "skip") return;
    (p.tune || []).forEach((t, i) => {
      const id = `bt-${p.code}-${i}`;
      front.push({ id, text: t, ch: p.name, done: !!data.done[id] });
    });
  });

  const regCats = Array.from(new Set(data.regulations.map((r) => r.category || "Общие")));

  // CRUD operations for deals
  const updDeal = (id, patch) => {
    updateData("deals", data.deals.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  const commitDeal = (id) => {
    const d = data.deals.find((x) => x.id === id);
    if (d) saveRow("deals", dealToDB(d));
  };

  const addDeal = () => {
    const d = {
      id: uid(),
      client: "",
      clientId: "",
      vertical: "iGaming",
      service: "ASO",
      value: 0,
      paid: 0,
      lines: [],
      stage: "lead",
      assignee: data.team[0]?.id || null,
      next: "",
      due: "",
    };
    updateData("deals", [d, ...data.deals]);
    saveRow("deals", dealToDB(d));
    setOpenDeal(d.id);
    go("deals");
    setSub("board");
  };

  const delDeal = (id) => {
    showConfirm("Удалить сделку?", "Это действие нельзя отменить.", () => {
      updateData("deals", data.deals.filter((d) => d.id !== id));
      dropRow("deals", id);
      if (openDeal === id) setOpenDeal(null);
      toast.success("Сделка удалена");
    });
  };

  const setLines = (id, lines) => {
    updDeal(id, { lines });
    const d = data.deals.find((x) => x.id === id);
    if (d) saveRow("deals", dealToDB({ ...d, lines }));
  };

  const addLine = (d) => {
    setLines(d.id, [...(d.lines || []), { pid: data.prices[0]?.id, name: data.prices[0]?.name, retail: +data.prices[0]?.retail || 0, qty: 1 }]);
  };

  const updLine = (d, i, pid) => {
    const p = data.prices.find((x) => x.id === pid);
    setLines(d.id, (d.lines || []).map((l, idx) => (idx === i ? { pid, name: p?.name, retail: +p?.retail || 0, qty: l.qty } : l)));
  };

  const updLineQty = (d, i, qty) => {
    setLines(d.id, (d.lines || []).map((l, idx) => (idx === i ? { ...l, qty } : l)));
  };

  const rmLine = (d, i) => {
    setLines(d.id, (d.lines || []).filter((_, idx) => idx !== i));
  };

  // CRUD operations for clients
  const updCli = (id, patch) => {
    updateData("clients", data.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const commitCli = (id) => {
    const c = data.clients.find((x) => x.id === id);
    if (c) saveRow("clients", cliToDB(c));
  };

  const addCli = () => {
    const c = {
      id: uid(),
      name: "Новый клиент",
      contact: "",
      vertical: "iGaming",
      status: "new",
      lastContact: today(),
      note: "",
    };
    updateData("clients", [c, ...data.clients]);
    saveRow("clients", cliToDB(c));
    setOpenClient(c.id);
  };

  const addCliFromDeal = (d) => {
    const c = {
      id: uid(),
      name: d.client || "Новый клиент",
      contact: "",
      vertical: d.vertical,
      status: "new",
      lastContact: today(),
      note: "",
    };
    updateData("clients", [c, ...data.clients]);
    saveRow("clients", cliToDB(c));
    updDeal(d.id, { clientId: c.id });
    const nd = { ...d, clientId: c.id };
    saveRow("deals", dealToDB(nd));
  };

  const delCli = (id) => {
    showConfirm("Удалить клиента?", "Это действие нельзя отменить.", () => {
      updateData("clients", data.clients.filter((c) => c.id !== id));
      dropRow("clients", id);
      toast.success("Клиент удалён");
    });
  };

  const contacted = (id) => {
    updCli(id, { lastContact: today() });
    const c = data.clients.find((x) => x.id === id);
    if (c) saveRow("clients", cliToDB({ ...c, lastContact: today() }));
    toast.success("Контакт обновлён");
  };

  const cliAgg = (cid) => {
    const ds = data.deals.filter((d) => d.clientId === cid);
    return { count: ds.length, total: ds.reduce((a, d) => a + valOf(d), 0) };
  };

  // Settings
  const setBase = (v) => {
    const newSettings = { ...data.settings, baseContacts: +v || 0 };
    updateData("settings", newSettings);
    updateSettings(newSettings);
  };

  const setGoal = (v) => {
    const newSettings = { ...data.settings, goal: +v || 0 };
    updateData("settings", newSettings);
    updateSettings(newSettings);
  };

  const selectService = (i) => {
    const p = data.prices[i];
    if (p) setCalc({ idx: i, price: +p.retail || 0, cost: +p.cost || 0 });
  };

  // Loading state
  if (!ready) {
    return (
      <div className="cc">
        <style>{css}</style>
        <Loader2 className="spin" size={24} />
      </div>
    );
  }

  // Login screen
  if (!session) {
    return (
      <ErrorBoundary>
        <style>{css}</style>
        <Login onSignIn={signIn} onSignUp={signUp} />
      </ErrorBoundary>
    );
  }

  // Main app
  return (
    <ErrorBoundary>
      <style>{css}</style>
      <Layout
        section={section}
        onNavigate={go}
        onSignOut={signOut}
        user={user}
        userProfile={myProfile}
        userRole={myRole}
        visibleSections={visibleSections}
      >
        {loading ? (
          <div className="cc tall">
            <Loader2 className="spin" size={24} />
            <span className="cc-t">Загружаю данные…</span>
          </div>
        ) : (
          <>
            <main className="main">
              <header className="ahead">
                <div className="atitle">
                  {(() => {
                    const curSection = SECTIONS.find((s) => s.key === section);
                    return curSection ? (
                      <>
                        <curSection.Icon size={19} />
                        {curSection.label}
                      </>
                    ) : null;
                  })()}
                </div>
                <div className="pills">
                  {(() => {
                    const curSection = SECTIONS.find((s) => s.key === section);
                    return curSection?.subs.map((t) => (
                      <button
                        key={t.k}
                        className={`pill ${sub === t.k ? "on" : ""}`}
                        onClick={() => setSub(t.k)}
                      >
                        {t.label}
                      </button>
                    ));
                  })()}
                </div>
              </header>
              <div className="content">
                {visibleSections.length === 0 ? (
                  <div className="empty">Нет доступных разделов для роли.</div>
                ) : (
                  <div>
                    {/* Placeholder for screens - will be implemented in separate components */}
                    <div className="panel">
                      <div className="ph">Раздел {section} / {sub}</div>
                      <div className="empty">Экран в разработке...</div>
                    </div>
                  </div>
                )}
              </div>
            </main>
          </>
        )}
      </Layout>
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => {
          confirmDialog.onConfirm?.();
          hideConfirm();
        }}
        onCancel={hideConfirm}
      />
    </ErrorBoundary>
  );
}

export default App;
