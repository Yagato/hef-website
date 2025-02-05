import ReactPlayer from 'react-player';
import {
	createRef, useEffect, useMemo, useState,
} from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import InfiniteScroll from 'react-infinite-scroll-component';
import { GetStaticPaths, GetStaticProps } from 'next';
import mongoose from 'mongoose';
import safeJsonStringify from 'safe-json-stringify';
import dynamic from 'next/dynamic';
import Head from '../../components/Head';
import BlurBackground from '../../components/project/BlurBackground';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import TextHeader from '../../components/TextHeader';
import Project, { ILink, IProject } from '../../models/Project';
import Submission, { ISubmission } from '../../models/Submission';
import 'github-markdown-css/github-markdown-light.css';
import Guild, { IGuild } from '../../models/Guild';

const ExperimentalProjectPage = dynamic(() => import('../../components/project/experimental/Page'), {
	loading: () => <span>Loading...</span>,
});

const Phaser = dynamic(() => import('../../components/project/Phaser'), {
	loading: () => <span>Loading...</span>,
});

const SUBMISSIONS_PER_LOAD = 10;

// ID's for both production and development databases
const ID_TO_STYLE_MAP = new Map<string, string>();
ID_TO_STYLE_MAP.set('CGeclp7hLj-lpprbhKxX5', 'theme-calli');
ID_TO_STYLE_MAP.set('hirD8XHurcDYFoNQOFh7p', 'theme-calli');
ID_TO_STYLE_MAP.set('jnTqYPtoPDKlvXKuBcHuo', 'theme-kiara');
ID_TO_STYLE_MAP.set('J9600ROFekClHLwtzquhd', 'theme-kiara');
ID_TO_STYLE_MAP.set('rZNhEJYuseKIKkeSaUSD6', 'theme-ina');
ID_TO_STYLE_MAP.set('rWykVp0wwqJfqVOiiwuHC', 'theme-ina');
ID_TO_STYLE_MAP.set('BSq6epH_Y1ffq0j1ZWOLT', 'theme-gura');
ID_TO_STYLE_MAP.set('0RdYs2xMNnjmHpIX3CvH6', 'theme-gura');
ID_TO_STYLE_MAP.set('mnFswH44ZCTyQiC8LPgRH', 'theme-ame');
ID_TO_STYLE_MAP.set('pnJc6y2SRMbNunt1vOUkR', 'theme-ame');
ID_TO_STYLE_MAP.set('hpTi3BFuM46B5SBCyrc-5', 'theme-irys');
ID_TO_STYLE_MAP.set('LHYI_i9eFfDYXksaKKxLB', 'theme-irys');
ID_TO_STYLE_MAP.set('RYpamVJXs76uWEept42Td', 'theme-sana');
ID_TO_STYLE_MAP.set('94mdRp-j2N8spCx-6UyRE', 'theme-sana');
ID_TO_STYLE_MAP.set('h_LNkS8pI64naLiWSafDj', 'theme-fauna');
ID_TO_STYLE_MAP.set('BPyt7-SyXPhyTR9m5i6P2', 'theme-fauna');
ID_TO_STYLE_MAP.set('B5vtBaIkfuys1Ln3XMoOY', 'theme-kronii');
ID_TO_STYLE_MAP.set('-JoyPM46syqox0jp7NXG5', 'theme-kronii');
ID_TO_STYLE_MAP.set('-ew0gw2u7gk8GdFyxP1-u', 'theme-kronii');
ID_TO_STYLE_MAP.set('_0S7wwTwY17pDkHzWF9QH', 'theme-kronii');
ID_TO_STYLE_MAP.set('vCy2Gob7GNK3SOFufaV7K', 'theme-mumei');
ID_TO_STYLE_MAP.set('c8FUeIsD1jP6a4xUMBubS', 'theme-mumei');
ID_TO_STYLE_MAP.set('lTv1XHPYI8tt7Lzh7g6qk', 'theme-mumei');
ID_TO_STYLE_MAP.set('CesQIHnCRvh9RWkhC_XN_', 'theme-mumei');
ID_TO_STYLE_MAP.set('VkCh1E0PGq8swBN3h7sse', 'theme-bae');
ID_TO_STYLE_MAP.set('jBX00De0x_fJWg7UhDkOK', 'theme-bae');

interface IProps {
	doc: IProject,
	allSubmissions: ISubmission[],
	guild: IGuild,
}

// eslint-disable-next-line max-len
export default function ProjectPage({ doc, allSubmissions, guild }: IProps) {
	const router = useRouter();
	const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
	const [shownSubmissions, setShownSubmissions] = useState<ISubmission[]>([]);

	const ref = useMemo(() => createRef<BlurBackground>(), []);

	const themeStyle = ID_TO_STYLE_MAP.get(doc.guild);

	const loadMoreSubmissions = () => {
		const newSubLength = shownSubmissions.length + SUBMISSIONS_PER_LOAD;
		setShownSubmissions(allSubmissions.slice(0, newSubLength));
	};

	useEffect(() => {
		setShownSubmissions(allSubmissions.slice(0, SUBMISSIONS_PER_LOAD));
	}, [allSubmissions]);

	// eslint-disable-next-line react/no-unstable-nested-components
	function CurrentGalleryItem() {
		if (!doc.media) return null;
		if (doc.media[currentMediaIndex].type === 'video') {
			return (
				<ReactPlayer
					width="100%"
					height="100%"
					url={doc.media[currentMediaIndex].src}
					controls
					light
				/>
			);
		}
		if (doc.media[currentMediaIndex].type === 'image') {
			return (
				<img
					className="max-w-full max-h-full object-contain"
					src={doc.media[currentMediaIndex].src}
					alt=""
					loading="lazy"
				/>
			);
		}
		return <p>Invalid media</p>;
	}

	const Submissions = useMemo(() => {
		// eslint-disable-next-line no-undef
		const submissionElements: JSX.Element[] = [];
		shownSubmissions.forEach((submission, index) => {
			submissionElements.push(
				<div className="w-full max-h-full text-black dark:text-white" key={submission._id as unknown as string}>
					<div className="w-full flex mt-4 h-14">
						{submission.srcIcon && (
							<img
								className="object-cover w-14 h-14 rounded-full"
								src={submission.srcIcon}
								alt="author icon"
							/>
						)}
						{submission.author && (
							<div className="text-lg mt-3 ml-4">
								From:
								{' '}
								<span className="font-bold">{submission.author}</span>
							</div>
						)}
						<div className="flex-grow" />
						<p className="text-xl mt-3 mr-4">{`#${index + 1}`}</p>
					</div>
					<div className="w-full mt-3">
						{submission.type === 'video' && (
							<ReactPlayer
								width="100%"
								height="100%"
								url={submission.src}
								controls
								light
								className="mb-4 mt-4"
							/>
						)}
						{submission.type === 'image' && (
							<div className="mt-4 mb-2 w-full h-full max-h-[750px] flex justify-center">
								<img
									className="max-w-10/12 object-contain mb-4"
									src={submission.src}
									alt=""
									loading="lazy"
								/>
							</div>
						)}
						{submission.message && (
							<p className="mx-4 mb-4 w-auto h-full overflow-auto whitespace-pre-line dark:text-gray-300">
								{submission.message}
							</p>
						)}
						<hr className="border-t-1 border-dashed border-gray-400" />
					</div>
				</div>,
			);
		});

		return (
			<div className="w-full h-full flex justify-center">
				<div className="sm:w-11/12 md:w-10/12 h-full">
					{submissionElements}
				</div>
			</div>
		);
	}, [shownSubmissions]);

	if (doc.flags?.includes('experimental')) {
		return (
			<ExperimentalProjectPage guild={guild} project={doc} submissions={allSubmissions} />
		);
	}

	if (doc.flags?.includes('guratanabata')) {
		return (
			<>
				<Head
					color={guild.color ?? '#FF3D3D'}
					title={doc.title}
					description={doc.shortDescription}
					keywords={['guratanabata']}
					image={doc.ogImage ?? 'https://holoen.fans/img/logo.png'}
				/>
				<BlurBackground ref={(bg) => {
					(ref as any).current = bg;
				}}
				/>
				{/* Don't use Suspense, we're still running on React 17 here due to MUI */}
				<Phaser
					scene="guratanabata"
					data={{
						setBackgroundImage: (to: string) => ref.current?.setBackgroundImage(to),
						submissions: allSubmissions,
					}}
				/>
			</>
		);
	}

	return (
		<>
			<Head
				color={guild.color ?? '#FF3D3D'}
				title={doc.title}
				description={doc.shortDescription}
				url={`https://holoen.fans${router.pathname.replace(/\[id\]/gi, router.query.id as string)}`}
				keywords={[doc.title.toLowerCase()]}
				image={doc.ogImage ?? 'https://holoen.fans/img/logo.png'}
			/>

			<div className={themeStyle}>
				<div className="flex flex-col h-full min-h-screen bg-skin-background-1 dark:bg-skin-dark-background-1">
					{!doc.flags?.includes('disableNavbar') && <Navbar disableHead />}

					{
						!doc.flags?.includes('disableHeader') && (
							<Header
								title={doc.title ?? 'unknown'}
								description={doc.shortDescription ?? ''}
							/>
						)
					}

					<div className="flex-grow">
						<div className="my-16 w-full flex flex-col items-center">
							<div className="max-w-4xl w-full mx-4 break-words md:break-normal">
								<div>
									<TextHeader text="Description" />
									<div className="markdown-body">
										<ReactMarkdown
											className="px-4 sm:px-0 text-black dark:text-white dark:text-opacity-80"
										>
											{
												doc.description && doc.description
													.replace(/(\\\n```)/gim, '\n```')
													.replace(/(```\n\\)|(```\n\n\\)/gim, '```\n')
											}
										</ReactMarkdown>
									</div>
								</div>
								{(doc.media?.length ?? 0) > 0 && (
									<div className="mt-4">
										<TextHeader text="Gallery" />
										<div className="flex flex-col items-center pt-2">
											<div className="w-full h-52 sm:w-8/12 sm:h-96">
												{CurrentGalleryItem}
											</div>
											<div
												className="flex mt-2 font-bold items-center justify-center text-center"
											>
												<ChevronLeftIcon
													className={
														currentMediaIndex > 0
															? 'h-8 w-8 cursor-pointer text-black dark:text-white'
															: 'h-8 w-8 text-skin-primary-1 text-opacity-30 dark:text-skin-dark-primary-1 dark:text-opacity-30'
													}
													onClick={() => {
														if (currentMediaIndex > 0) {
															setCurrentMediaIndex(currentMediaIndex - 1);
														}
													}}
												/>
												<span className="text-black dark:text-white">
													{currentMediaIndex + 1}
													/
													{doc.media ? doc.media.length : 0}
												</span>
												<ChevronRightIcon
													className={
														currentMediaIndex + 1
														< (doc.media ? doc.media.length : 0)
															? 'h-8 w-8 cursor-pointer text-black dark:text-white'
															: 'h-8 w-8 text-skin-primary-1 text-opacity-30 dark:text-skin-dark-primary-1 dark:text-opacity-30'
													}
													onClick={() => {
														if (
															currentMediaIndex + 1
															< (doc.media ? doc.media.length : 0)
														) {
															setCurrentMediaIndex(currentMediaIndex + 1);
														}
													}}
												/>
											</div>
										</div>
									</div>
								)}
								{(doc.links?.length ?? 0) > 0 && (
									<div className="mt-4">
										<TextHeader text="Links" />
										<div className="flex justify-center space-x-6 px-4 sm:px-0">
											{doc.links
												&& doc.links.map((link: ILink, index: number) => (
													<div
														key={`link-${index}` /* eslint-disable-line react/no-array-index-key */}
														className="rounded-3xl font-bold w-[6rem] h-10 flex items-center justify-center mt-4 content-end
													bg-skin-secondary-1 dark:bg-skin-dark-secondary-1 text-white hover:text-opacity-70 text-center"
													>
														<a href={link.link} target="_blank" rel="noreferrer">
															{link.name}
														</a>
													</div>
												))}
										</div>
									</div>
								)}
								{/* TODO: Move submissions to separate tab */}
								{((shownSubmissions?.length ?? 0) > 0) && (
									<div className="mt-4">
										<TextHeader text="Submissions" />
										<div className="flex flex-col items-center pt-2">
											<div className="w-full overflow-auto">
												<InfiniteScroll
													dataLength={shownSubmissions.length}
													next={loadMoreSubmissions}
													hasMore={shownSubmissions.length < allSubmissions.length}
													loader={(
														<p
															className="text-black dark:text-white text-center mt-4"
														>
															Loading...
														</p>
													)}
													scrollThreshold="500px"
												>
													{Submissions}
												</InfiniteScroll>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>

					{!doc.flags?.includes('disableFooter') && <Footer />}
				</div>
			</div>
		</>
	);
}

export const getStaticPaths: GetStaticPaths = async () => {
	if (process.env.NODE_ENV === 'production') {
		return {
			paths: [
				{
					params: {
						id: '14',
					},
				},
				{
					params: {
						id: '16',
					},
				},
				{
					params: {
						id: '17',
					},
				},
				{
					params: {
						id: '18',
					},
				},
			],
			fallback: false,
		};
	}

	try {
		mongoose.connect(process.env.MONGOOSEURL!);
		// eslint-disable-next-line no-empty
	} catch (e) {
	}

	const projects = await Project.find({}).lean().exec();

	return {
		paths: projects.map((project) => (
			{
				params: { id: project._id.toString() },
			}
		)),
		fallback: false,
	};
};

export const getStaticProps: GetStaticProps = async (context) => {
	try {
		mongoose.connect(process.env.MONGOOSEURL!);
		// eslint-disable-next-line no-empty
	} catch (e) {
	}

	const project = await Project.findById(context.params?.id).lean().exec()
		.catch((e) => {
			throw e;
		});

	if (!project) {
		return {
			notFound: true,
		};
	}

	const projectData: IProject = await JSON.parse(safeJsonStringify(project));

	const submissions: ISubmission[] = await Submission.find({
		project: project._id,
	}).lean().exec().catch((e) => {
		throw e;
	});

	const projectSubmissions: ISubmission[] = await JSON.parse(safeJsonStringify(submissions));

	const guild = await Guild.findById(project.guild)
		.lean().exec().catch((e) => {
			throw e;
		});

	const guildJson: IGuild = await JSON.parse(safeJsonStringify(guild as object));

	return {
		props: {
			doc: projectData,
			allSubmissions: projectSubmissions,
			guild: guildJson,
		},
	};
};
