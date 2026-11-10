import service from "../services/interview.service.js";
import { EMAIL_TYPE } from "../constants/email.js";

const wrap = fn => async (req, res, next) => { try { const data = await fn(req); res.status(200).json({ success: true, data }); } catch (e) { next(e); } };
export default {
    schedule: wrap(req => service.setInterview(req.user.id, req.params.applicationId, req.body)),
    bulkSchedule: wrap(req => service.bulkSetInterviews(req.user.id, req.body.applicationIds, req.body.interview)),
    list: wrap(req => service.listInterviews(req.user.id, req.query.from, req.query.to)),
    detail: wrap(req => service.detail(req.user.id, req.params.id)),
    getByApplication: wrap(req => service.getByApplication(req.user.id, req.params.applicationId)),
    evaluate: wrap(req => service.evaluate(req.user.id, req.params.applicationId, req.body.notes)),
    notes: wrap(req => service.updateNotes(req.user.id, req.params.id, req.body.notes)),
    passed: wrap(req => service.passedCandidates(req.user.id)),
    invitation: wrap(req => service.sendCandidateEmail(req.user.id, req.params.applicationId, EMAIL_TYPE.INTERVIEW_INVITATION, req.body.subject, req.body.body)),
    result: wrap(req => service.sendCandidateEmail(req.user.id, req.params.applicationId, req.body.result === "PASSED" ? EMAIL_TYPE.INTERVIEW_PASSED : EMAIL_TYPE.INTERVIEW_REJECTED, req.body.subject, req.body.body))
};
