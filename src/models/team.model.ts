import mongoose from 'mongoose'

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Team must have a name'] },
    description: { type: String },
    members: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Team must have a creator'],
    },
  },
  { timestamps: true }
)

teamSchema.index({ members: 1 })
teamSchema.index({ createdBy: 1 })

export const Team = mongoose.model('Team', teamSchema)
