<script lang="ts">
	import { BarChart, Spline } from 'layerchart';
	import * as d3shapes from 'd3-shape';
	import * as Chart from "$lib/components/ui/chart/index.js";
	import * as m from '$lib/paraglide/messages';

	type Props = {
		statistics?: Data.StoredPageVisitStat[];
	};

	type ChartPoint = {
		label: string;
		count: number;
		isoDay: string;
	};

	type WeekdayPoint = {
		label: string;
		count: number;
		weekdayIndex: number;
	};

	const { statistics = [] }: Props = $props();

	const millisecondsPerDay = 24 * 60 * 60 * 1000;

	function toIsoDay(date: Date) {
		return date.toISOString().slice(0, 10);
	}

	function buildDailySeries(days: number): ChartPoint[] {
		const today = new Date();
		const byDay = new Map<string, number>();

		for (const row of statistics) {
			const visitCount = Number(row.visitCount);
			if (!Number.isFinite(visitCount) || visitCount <= 0) {
				continue;
			}

			byDay.set(row.day, visitCount);
		}

		const formatter = new Intl.DateTimeFormat(undefined, {
			month: 'short',
			day: 'numeric'
		});

		const result: ChartPoint[] = [];
		for (let offset = days - 1; offset >= 0; offset -= 1) {
			const dayDate = new Date(today.getTime() - (offset * millisecondsPerDay));
			const isoDay = toIsoDay(dayDate);

			result.push({
				label: formatter.format(dayDate),
				count: byDay.get(isoDay) ?? 0,
				isoDay
			});
		}

		return result;
	}

	function buildWeeklySeries(weeks: number): ChartPoint[] {
		const recentDays = buildDailySeries(weeks * 7);
		const result: ChartPoint[] = [];

		for (let index = 0; index < weeks; index += 1) {
			const startIndex = index * 7;
			const weekSlice = recentDays.slice(startIndex, startIndex + 7);
			if (weekSlice.length === 0) {
				continue;
			}

			const first = weekSlice[0];
			const last = weekSlice[weekSlice.length - 1];
			const total = weekSlice.reduce((sum, point) => {
				return sum + point.count;
			}, 0);

			result.push({
				label: `${first.label} - ${last.label}`,
				count: total,
				isoDay: last.isoDay
			});
		}

		return result;
	}

	function buildWeekdaySeries(): WeekdayPoint[] {
		const weekdayLabels = [
			m.statistics_weekday_mo(),
			m.statistics_weekday_tu(),
			m.statistics_weekday_we(),
			m.statistics_weekday_th(),
			m.statistics_weekday_fr(),
			m.statistics_weekday_sa(),
			m.statistics_weekday_su()
		];

		const counts = Array.from({ length: 7 }, () => 0);

		for (const row of statistics) {
			const visitCount = Number(row.visitCount);
			if (!Number.isFinite(visitCount) || visitCount <= 0) {
				continue;
			}

			const dayDate = new Date(`${row.day}T00:00:00.000Z`);
			if (Number.isNaN(dayDate.getTime())) {
				continue;
			}

			const weekdayIndex = (dayDate.getUTCDay() + 6) % 7;
			counts[weekdayIndex] += visitCount;
		}

		return weekdayLabels.map((label, weekdayIndex) => {
			return {
				label,
				count: counts[weekdayIndex],
				weekdayIndex
			};
		});
	}

	function createTickFn(stepLimit: number) {
		return (scale: any) => {
			const step = scale.step();
			if (step > stepLimit) {
				return scale.domain();
			}

			return scale.domain().filter((_: any, index: number) => {
				return index % Math.ceil(stepLimit / step) === 0;
			});
		};
	}

	const dailySeries = $derived(buildDailySeries(14));
	const weeklySeries = $derived(buildWeeklySeries(8));
	const weekdaySeries = $derived(buildWeekdaySeries());

	const totalDailyVisits = $derived(dailySeries.reduce((sum, point) => {
		return sum + point.count;
	}, 0));

	const totalWeeklyVisits = $derived(weeklySeries.reduce((sum, point) => {
		return sum + point.count;
	}, 0));

	const totalWeekdayVisits = $derived(weekdaySeries.reduce((sum, point) => {
		return sum + point.count;
	}, 0));

	const dailyChartConfig = {
		count: {
			label: m.statistics_visits(),
			color: 'var(--chart-1)'
		},
		trend: {
			label: m.statistics_trend(),
			color: 'var(--chart-3)'
		}
	} satisfies Chart.ChartConfig;

	const weeklyChartConfig = {
		count: {
			label: m.statistics_visits(),
			color: 'var(--chart-2)'
		},
		trend: {
			label: m.statistics_trend(),
			color: 'var(--chart-4)'
		}
	} satisfies Chart.ChartConfig;

	const weekdayChartConfig = {
		count: {
			label: m.statistics_visits(),
			color: 'var(--chart-5)'
		}
	} satisfies Chart.ChartConfig;

	const dailyXAxisProps = {
		ticks: createTickFn(50),
		tickMultiline: true
	};

	const weeklyXAxisProps = {
		ticks: createTickFn(100),
		tickMultiline: true
	};
</script>

<div class="w-full max-w-6xl min-w-form space-y-6">
	<section class="space-y-2">
		<h2 class="text-xl font-semibold">{m.statistics_daily_visits_last_14_days()}</h2>
		<p class="text-sm text-muted-foreground">{m.statistics_total_visits()} {totalDailyVisits}</p>
		<Chart.Container config={dailyChartConfig} class="rounded-md border bg-card p-3 min-h-45 max-h-72 w-full">
			<BarChart
				data={dailySeries}
				x="label"
				y="count"
				axis="x"
				props={{ xAxis: dailyXAxisProps }}
				grid
				rule={false}
				series={[
					{
						key: 'count',
						label: dailyChartConfig.count.label,
						color: dailyChartConfig.count.color
					}
				]}
			>
				{#snippet tooltip()}
					<Chart.Tooltip indicator="line" />
				{/snippet}
				{#snippet aboveMarks()}
					<Spline
						data={dailySeries}
						x="label"
						y="count"
						stroke="var(--color-trend)"
						stroke-width={2}
						curve={d3shapes['curveBasis']}
						fill="none"
					/>
				{/snippet}
			</BarChart>
		</Chart.Container>
	</section>

	<section class="space-y-2">
		<h2 class="text-xl font-semibold">{m.statistics_weekly_visits_last_8_weeks()}</h2>
		<p class="text-sm text-muted-foreground">{m.statistics_total_visits()} {totalWeeklyVisits}</p>
		<Chart.Container config={weeklyChartConfig} class="rounded-md border bg-card p-3 min-h-45 max-h-72 w-full">
			<BarChart
				data={weeklySeries}
				x="label"
				y="count"
				axis="x"
				props={{ xAxis: weeklyXAxisProps }}
				grid
				rule={false}
				series={[
					{
						key: 'count',
						label: weeklyChartConfig.count.label,
						color: weeklyChartConfig.count.color
					}
				]}
			>
				{#snippet tooltip()}
					<Chart.Tooltip indicator="line" />
				{/snippet}
				{#snippet aboveMarks()}
					<Spline
						data={weeklySeries}
						x="label"
						y="count"
						stroke="var(--color-trend)"
						stroke-width={2}
						curve={d3shapes['curveBasis']}
						fill="none"
					/>
				{/snippet}
			</BarChart>
		</Chart.Container>
	</section>

	<section class="space-y-2">
		<h2 class="text-xl font-semibold">{m.statistics_weekday_visits_mo_to_su()}</h2>
		<p class="text-sm text-muted-foreground">{m.statistics_total_visits()} {totalWeekdayVisits}</p>
		<Chart.Container config={weekdayChartConfig} class="rounded-md border bg-card p-3 min-h-45 max-h-72 w-full">
			<BarChart
				data={weekdaySeries}
				x="label"
				y="count"
				axis="x"
				grid
				rule={false}
				series={[
					{
						key: 'count',
						label: weekdayChartConfig.count.label,
						color: weekdayChartConfig.count.color
					}
				]}
			>
				{#snippet tooltip()}
					<Chart.Tooltip indicator="line" />
				{/snippet}
			</BarChart>
		</Chart.Container>
	</section>
</div>