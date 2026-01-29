import { query } from '../config/db-middleware';

export const createLog = async (data: any) => {
  const queryStr = `
    INSERT INTO activity_logs 
    (
      actor_id, actor_name, role_name, 
      action_type, resource_type, resource_id, 
      details, ip_address, user_agent, is_success
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `;
  const values = [
    data.actorId,
    data.actorName,
    data.role,
    data.action,
    data.resourceType,
    data.resourceId,
    data.details,
    data.ip,
    data.userAgent,
    data.isSuccess
  ];
  await query(queryStr, values);
}