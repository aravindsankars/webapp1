const { User } = require('../models/user');
const { Assignment } = require('../models/assignments');
const { Submit } = require('../models/submit');
// const { contr } = require('../controllers/assignmentsControllers');

async function findId(pEmail) {
  const aUser = await User.findOne({
    where: {
      email: pEmail,
    },
  });
  const Id = String(aUser.id);
  return Id;
}

async function findPwd(pEmail) {
  console.log("email is ->" + pEmail);
  console.log("User is ->" + User);
  const aUser = await User.findOne({
    where: {
      email: pEmail,
    },
  });
  const Pwd = String(aUser.password);
  console.log(Pwd);
  return Pwd;
}


async function findAssignmentInfo(assignmentId) {
  try {
    const assignmentInfo = await Assignment.findOne({
      where: {
        id: assignmentId,
      },
    });

    return assignmentInfo;
  } catch (error) {
    console.error('Error finding assignment information:', error);
    throw error;
  }
}

async function updateAssignment(assignmentId, updatedData) {
  console.log("assignmentId-------------------" + assignmentId);
  try {
    console.log("assignmentId-------------------" + assignmentId);
    console.log("updatedData-------------------" + updatedData);
    const [affectedRows, [updatedAssignment]] = await Assignment.update(updatedData, {
      where: { id: assignmentId },
      returning: true,
    });
    console.log("updated", updatedAssignment);

    if (affectedRows > 0) {
      if (Array.isArray(updatedAssignment)) {
        const updatedAssignment = updatedAssignment[0];
        console.log('Assignment updated successfully:', updatedAssignment);
        return updatedAssignment;
      }
    }

    else if (affectedRows === 0) {
      console.log('Assignment not found or not updated');
      return null;
    }
  } catch (error) {
    console.error('Error updating assignment:', error);
    throw error;
  }
}


async function deleteAssignmentById(assignmentId) {
  try {
    const deletedRows = await Assignment.destroy({
      where: { id: assignmentId },
    });

    const deletedRows_Submission = await Submit.destroy({
      where: { assignment_id: assignmentId },
    });

    if (deletedRows > 0 && deletedRows_Submission > 0) {
      console.log('Assignment deleted successfully');
      return true;
    } else {
      console.log('Assignment not found or not deleted');
      return false;
    }
  } catch (error) {
    console.error('Error deleting assignment:', error);
    throw error;
  }
}

async function submitAssignment(assignmentId, submissionDetails) {
  try {
    const assignment = await findAssignmentInfo(assignmentId);

    if (!assignment) {
      console.error('Error submitting assignment: Assignment not found');
      throw new Error('Assignment not found');
    }

    // Check if the submission deadline has passed
    const currentDateTime = new Date();
    const deadlineDateTime = new Date(assignment.deadline);

    if (currentDateTime > deadlineDateTime) {
      console.error('Error submitting assignment: Submission deadline has passed');
      throw new Error('Submission deadline has passed');
    }

    // Check if the user has exceeded the maximum number of attempts
    const existingSubmissionsCount = await getSubmissionCountForAssignmentAndUser(assignmentId, submissionDetails.user_id);
    const maxAttempts = assignment.num_of_attemps;

    if (existingSubmissionsCount >= maxAttempts) {
      console.error('Error submitting assignment: User has exceeded the maximum number of attempts');
      throw new Error('User has exceeded the maximum number of attempts');
    }

    const submission = await Submit.create({
      submission_url: submissionDetails.submission_url,
      submission_date: new Date(),
      submission_updated: new Date(),
      assignment_id: assignmentId,
      user_id: id
    });

    console.log('Assignment submitted successfully:', submission);
    return submission;
  } catch (error) {
    console.error('Error submitting assignment:', error);
    throw error;
  }
}

async function getSubmissionCountForAssignmentAndUser(assignmentId, userId) {
  try {
    const submissionCount = await Submit.count({
      where: {
        assignment_id: assignmentId,
        user_id: userId
      }
    });
    return submissionCount;
  } catch (error) {
    console.error('Error getting submission count:', error);
    throw error;
  }
}

module.exports = {
  findId, findPwd, findAssignmentInfo, updateAssignment, deleteAssignmentById, 
  submitAssignment
};