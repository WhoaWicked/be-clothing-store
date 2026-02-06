import { query } from '../../config/db-middleware';

export const countLogs = async (filters: any) => {
  const { search_global, action, start_date, end_date, role_name, is_success } = filters;
  const conditions = [];
  const params: any[] = [];
  let paramCount = 0;
  if (search_global) {
    paramCount++;
    conditions.push(`(
      u.username       ILIKE $${paramCount} OR
      u.email          ILIKE $${paramCount} OR
      u.first_name     ILIKE $${paramCount} OR
      u.last_name      ILIKE $${paramCount} OR
      l.action_type    ILIKE $${paramCount}
      )`);
    params.push(`%${search_global}%`);
  }
  if (action) {
    conditions.push(`l.action_type ILIKE $${++paramCount}`);
    params.push(`%${action}%`);
  }
  if (role_name) {
    conditions.push(`l.role_name ILIKE $${++paramCount}`);
    params.push(`%${role_name}%`);
  }
  if (is_success) {
    conditions.push(`l.is_success = $${++paramCount}`);
    params.push(is_success === 'true');
  }
  if (start_date && end_date) {
    conditions.push(`l.created_at BETWEEN $${++paramCount} AND $${++paramCount}`);
    params.push(start_date, end_date);
  }
  let queryStr = `
    SELECT 
    COUNT (*) AS total
    FROM activity_logs l
    LEFT JOIN users u ON l.actor_id = u.id
    LEFT JOIN roles r ON u.role_id = r.id
  `;
  if (conditions.length > 0) {
    queryStr += ` WHERE ${conditions.join(' AND ')}`;
  }
  const { rows } = await query(queryStr, params);
  return Number(rows[0].total);
}

export const findLogs = async (filters: any) => {
  const { page, limit, search_global, sort_type, action, start_date, end_date, role_name, is_success } = filters;
  const offset = (page - 1) * limit;
  const conditions = [];
  const params: any[] = [];
  let paramCount = 0;
  if (search_global) {
    paramCount++;
    conditions.push(`(
      u.username       ILIKE $${paramCount} OR
      u.email          ILIKE $${paramCount} OR
      u.first_name     ILIKE $${paramCount} OR
      u.last_name      ILIKE $${paramCount} OR
      l.action_type    ILIKE $${paramCount}
      )`);
    params.push(`%${search_global}%`);
  }
  if (action) {
    conditions.push(`l.action_type ILIKE $${++paramCount}`);
    params.push(`%${action}%`);
  }
  if (role_name) {
    conditions.push(`l.role_name ILIKE $${++paramCount}`);
    params.push(`%${role_name}%`);
  }
  if (is_success) {
    conditions.push(`l.is_success = $${++paramCount}`);
    params.push(is_success === 'true');
  }

  if (start_date && end_date) {
    conditions.push(`l.created_at BETWEEN $${++paramCount} AND $${++paramCount}`);
    params.push(start_date, end_date);
  }

  let sortClause = 'l.created_at DESC';
  switch (sort_type) {
    case 'oldest':
      sortClause = 'l.created_at ASC';
      break;
    case 'newest':
    default:
      sortClause = 'l.created_at DESC';
      break;
  }
  let queryStr = `
    SELECT 
    l.id AS log_id,
    l.action_type,
    l.resource_type,
    l.resource_id,
    l.details,
    l.is_success,
    l.created_at,
    l.ip_address,
    l.actor_id,
    l.actor_name AS snapshot_name,
    l.role_name AS snapshot_role,
    u.username AS current_username,
    COALESCE(NULLIF(TRIM(CONCAT(u.first_name, ' ', u.last_name)), ''), NULL) AS current_full_name,
    u.email AS current_email,
    u.is_active AS current_active_status,
    u.role_id AS current_role_id,
	  r.role_name AS current_role_name
    FROM activity_logs l
    LEFT JOIN users u ON l.actor_id = u.id
    LEFT JOIN roles r ON u.role_id = r.id
  `;
  if (conditions.length > 0) {
    queryStr += ` WHERE ${conditions.join(' AND ')}`;
  }
  queryStr += ` ORDER BY ${sortClause} LIMIT $${++paramCount} OFFSET $${++paramCount}`;
  params.push(limit, offset);
  const { rows } = await query(queryStr, params);
  return rows;
}

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