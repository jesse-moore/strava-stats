import Activity from './models/activity';
import Stat from './models/stat';
import IndexMap from './models/indexMap';
import {
    ActivityModel,
    StatModel,
    IndexMapModel,
    TopActivities,
} from '../types';

export const findActivityByID = async (
    id: string
): Promise<ActivityModel | null> => {
    try {
        return await Activity.findById(id);
    } catch (error) {
        if (error.name === 'CastError') throw new Error('Invalid ID');
        throw new Error(error.message);
    }
};

export const getIndexMap = async (): Promise<IndexMapModel> => {
    try {
        const indexMap = await IndexMap.findOne({ of: 'strava_id' });
        if (indexMap === null) throw new Error('Index Map not found');
        if (!indexMap.index || !(indexMap.index instanceof Map))
            throw new Error('Invalid Index Map');

        return indexMap;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const findActivities = async ({
    page = 0,
    perPage = 0,
    year,
    month,
}: {
    page: number | undefined;
    perPage: number | undefined;
    year: number | undefined;
    month: number | undefined;
}): Promise<ActivityModel[]> => {
    try {
        const skip = page * perPage;

        const args: { [key: string]: number | string } = { type: 'Run' };
        if (year) args.year = year;
        if (month) args.month = month;
        return await Activity.find(args).skip(skip).limit(perPage);
    } catch (error) {
        throw new Error(error.message);
    }
};

export const findActivitiesById = async ({
    ids = [],
    projection = {},
}: {
    ids?: string[];
    projection?: { [k: string]: number };
}): Promise<ActivityModel[]> => {
    try {
        const args = ids.map((_id) => {
            return { _id };
        });
        return await Activity.find({ $or: args }, projection);
    } catch (error) {
        throw new Error(error.message);
    }
};

export const findStat = async (stat_id: number): Promise<StatModel | null> => {
    try {
        return await Stat.findOne({ stat_id });
    } catch (error) {
        throw new Error(error.message);
    }
};

export const findStats = async (
    filter: { stat_id: number }[]
): Promise<StatModel[] | null> => {
    try {
        return await Stat.find({
            $or: filter,
        });
    } catch (error) {
        throw new Error(error.message);
    }
};

export const findAvailableStats = async (): Promise<
    { result: { [k: string]: string[] } }[]
> => {
    try {
        return await Stat.aggregate([
            {
                $group: {
                    _id: '$year',
                    months: {
                        $push: {
                            $ifNull: ['$month', 0],
                        },
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    result: {
                        $push: {
                            k: {
                                $ifNull: [
                                    {
                                        $toString: '$_id',
                                    },
                                    '0',
                                ],
                            },
                            v: '$months',
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    result: {
                        $arrayToObject: {
                            $filter: {
                                input: '$result',
                                as: 'item',
                                cond: {
                                    $gt: [
                                        {
                                            $toDouble: '$$item.k',
                                        },
                                        0,
                                    ],
                                },
                            },
                        },
                    },
                },
            },
        ]);
    } catch (error) {
        throw new Error(error.message);
    }
};
