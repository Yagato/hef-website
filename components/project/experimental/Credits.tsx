import { useMemo } from 'react';

import ProjectCredit from './Credit';
import { ICredit } from '../../../models/Project';

export interface ProjectCreditsProps {
	credits: ICredit[],
}

export default function ProjectCredits({ credits }: ProjectCreditsProps) {
	const [organizers, artists, musicians, coders] = useMemo(() => credits
		.reduce(([_organizers, _artists, _musicians, _coders], credit) => {
			// eslint-disable-next-line default-case
			switch (credit.type) {
				case 'organization': _organizers.push(credit); break;
				case 'artwork': _artists.push(credit); break;
				case 'music': _musicians.push(credit); break;
				case 'code': _coders.push(credit); break;
			}
			return [_organizers, _artists, _musicians, _coders];
		}, [[], [], [], []] as ICredit[][])
		.map((type) => type.sort((firstCredit, secondCredit) => {
			if (firstCredit.user < secondCredit.user) return -1;
			if (firstCredit.user > secondCredit.user) return 1;
			return 0;
		})), [credits]);

	return (
		<div className="flex flex-col w-full h-full text-black dark:text-white px-5 lg:px-0">
			{(organizers.length > 0) && (
				<div className="flex flex-col w-full">
					<div className="flex flex-row my-8 w-full text-2xl font-bold border-b-2
                          text-center sm:text-left mb-6 text-skin-primary-1
                          dark:text-skin-dark-primary-1 border-skin-primary-1
                          border-opacity-30 dark:border-skin-dark-primary-1
                          dark:border-opacity-40"
					>
						<h3>{organizers.length > 1 ? 'Organizers' : 'Organizer'}</h3>
					</div>
					<div className="flex flex-row flex-wrap justify-center">
						{organizers.map((credit, index) => (
							// eslint-disable-next-line react/no-array-index-key
							<ProjectCredit key={`credits-organizers-${index}`} credit={credit} />
						))}
					</div>
				</div>
			)}
			{(artists.length > 0) && (
				<div className="flex flex-col w-full">
					<div className="flex flex-row my-8 w-full text-2xl font-bold border-b-2
                          text-center sm:text-left mb-6 text-skin-primary-1
                          dark:text-skin-dark-primary-1 border-skin-primary-1
                          border-opacity-30 dark:border-skin-dark-primary-1
                          dark:border-opacity-40"
					>
						<h3>{artists.length > 1 ? 'Artists' : 'Artist'}</h3>
					</div>
					<div className="flex flex-row flex-wrap justify-center">
						{artists.map((credit, index) => (
							// eslint-disable-next-line react/no-array-index-key
							<ProjectCredit key={`credits-artists-${index}`} credit={credit} />
						))}
					</div>
				</div>
			)}
			{(musicians.length > 0) && (
				<div className="flex flex-col w-full">
					<div className="flex flex-row my-8 w-full text-2xl font-bold border-b-2
                          text-center sm:text-left mb-6 text-skin-primary-1
                          dark:text-skin-dark-primary-1 border-skin-primary-1
                          border-opacity-30 dark:border-skin-dark-primary-1
                          dark:border-opacity-40"
					>
						<h3>{musicians.length > 1 ? 'Musicians' : 'Musician'}</h3>
					</div>
					<div className="flex flex-row flex-wrap justify-center">
						{musicians.map((credit, index) => (
							// eslint-disable-next-line react/no-array-index-key
							<ProjectCredit key={`credits-musicians-${index}`} credit={credit} />
						))}
					</div>
				</div>
			)}
			{(coders.length > 0) && (
				<div className="flex flex-col w-full">
					<div className="flex flex-row my-8 w-full text-2xl font-bold border-b-2
                          text-center sm:text-left mb-6 text-skin-primary-1
                          dark:text-skin-dark-primary-1 border-skin-primary-1
                          border-opacity-30 dark:border-skin-dark-primary-1
                          dark:border-opacity-40"
					>
						<h3>{coders.length > 1 ? 'Code Monkeys' : 'Code Monkey'}</h3>
					</div>
					<div className="flex flex-row flex-wrap justify-center">
						{coders.map((credit, index) => (
							// eslint-disable-next-line react/no-array-index-key
							<ProjectCredit key={`credits-coders-${index}`} credit={credit} />
						))}
					</div>
				</div>
			)}
		</div>
	);
}
