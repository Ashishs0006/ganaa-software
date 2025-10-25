// Global Import
import mongoose, { Model } from 'mongoose';
import Collections from '../../constant/collections';
import { ICenter, ICenterWithRoomTypes } from '../../interfaces/model/resources/i.center';

export interface ICenterModel extends Model<ICenter> {
  getCenterSummary(): Promise<ICenterWithRoomTypes[]>;
}

const centerSchema = new mongoose.Schema<ICenter>({
  centerName: {
    type: String,
    trim: true,
    index: true,
  },
  googleMapLink: {
    type: String,
    trim: true,
    default: '',
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Static Functions on Schema
 */
centerSchema.statics.getCenterSummary = async () => {
  const data = await Center.aggregate([
    // Match only non-deleted centers
    { $match: { $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }] } },

    // Lookup room types for each center
    {
      $lookup: {
        from: Collections.roomType.d,
        let: { centerId: '$_id' }, // Define the variable here
        pipeline: [
          // Match only room types that belong to this center
          {
            $match: {
              $and: [
                { $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }] },
                { $expr: { $eq: ['$centerId', '$$centerId'] } },
              ],
            },
          },

          // Lookup to join with room numbers and count them
          {
            $lookup: {
              from: Collections.roomNumber.name,
              let: { roomTypeId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }] },
                      { $expr: { $eq: ['$roomTypeId', '$$roomTypeId'] } },
                    ],
                  },
                },
              ],
              as: 'rooms',
            },
          },

          // Add the room count to each room type
          {
            $addFields: {
              totalRooms: { $size: '$rooms' },
            },
          },

          // Remove the temporary roomCount field
          { $project: { rooms: 0 } }, // Match room types that belong to this center
          { $match: { $expr: { $eq: ['$centerId', '$$centerId'] } } },

          // Lookup to join with room numbers
          {
            $lookup: {
              from: Collections.roomNumber.d,
              localField: '_id',
              foreignField: 'roomTypeId',
              as: 'rooms',
            },
          },

          // Add the room count to each room type
          {
            $addFields: {
              totalRooms: { $size: '$rooms' },
            },
          },

          // Remove the temporary rooms array
          { $project: { rooms: 0 } },
        ],
        as: 'roomType',
      },
    },

    // Project only the fields we want in the output
    {
      $project: {
        centerName: 1,
        roomType: {
          name: 1,
          order: 1,
          totalRooms: 1,
        },
      },
    },
  ]);

  return data;
};

const Center = mongoose.model<ICenter, ICenterModel>(Collections.center.name, centerSchema);

export default Center;
