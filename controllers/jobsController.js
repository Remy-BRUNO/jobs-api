const db = require("../db")
const {
  BadRequestError,
  UnauthenticatidedError,
  NotFoundError,
} = require("../errors")
const { StatusCodes } = require("http-status-codes")

const createJob = async (req, res) => {
  const { company, position, status } = req.body
  const { userID } = req.user

  if (!company || !position || !status) {
    throw new BadRequestError(`Veuillez remplire tout les champs`)
  }

  const {
    rows: [job],
  } = await db.query(
    "insert into jobs(company,position,user_id,status) values($1,$2,$3,$4) returning *",
    [company, position, userID, status]
  )
  res.status(StatusCodes.CREATED).json({ job: job })
}

const getAllJobs = async (req, res) => {
  const { rows: jobs } = await db.query(`SELECT * FROM jobs`)
  res.status(StatusCodes.OK).json({ jobs, count: jobs.length })
}

const getJob = async (req, res) => {
  const { id } = req.params

  const {
    rows: [job],
  } = await db.query("SELECT * FROM jobs where job_id=$1", [id])

  if (!job) {
    throw new BadRequestError(`Pas de job avec l'id ${id}`)
  }

  res.status(StatusCodes.OK).json({ job })
}

const updateJob = async (req, res) => {
  const { id } = req.params
  const { company, position, status } = req.body

  if (!company || !position || !status) {
    throw new BadRequestError(`Veuillez remplire tout les champs`)
  }

  const {
    rows: [job],
  } = await db.query(
    "UPDATE jobs SET company=$1,position=$2,status=$3 where job_id=$4 returning *",
    [company, position, status, id]
  )

  if (!job) {
    throw new BadRequestError(`Pas de job avec l'id ${id}`)
  }

  res.status(StatusCodes.OK).json({ job })
}

const deleteJob = async (req, res) => {
  const { id } = req.params

  const {
    rows: [job],
  } = await db.query("DELETE FROM jobs where job_id=$1 returning *", [id])
  if (!job) {
    throw new BadRequestError(`Pas de job avec l'id ${id}`)
  }

  res.status(StatusCodes.OK).json({ job })
}

module.exports = { createJob, getAllJobs, getJob, updateJob, deleteJob }
