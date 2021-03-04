import React from 'react';
import './App.scss';
import { createApiClient, Ticket } from './api';

export type AppState = {
	tickets?: TicketState[],
	search: string,
	page: number,
	sortBy: string,
	countHidden: number
}
export type TicketState = {
	ticket: Ticket,
	hide: boolean,
	showMore: boolean,
}
const api = createApiClient();

export class App extends React.PureComponent<{}, AppState> {
	state: AppState = {
		search: '',
		tickets: [],
		page: 1,
		sortBy: '',
		countHidden: 0
	}
	
	searchDebounce: any = null;
	async componentDidMount() {
		this.setState({
			
			tickets: (await api.getTickets(this.state.page, this.state.sortBy)).map((t) => {
				var ticket: TicketState = {
					ticket: t,
					hide: false,
					showMore: false
				}
				return ticket;
			})
		});
	}

	renderTickets = (tickets: TicketState[]) => {
		const filteredTickets = tickets
			.filter((t) => t.ticket ? (t.ticket.title.toLowerCase() + t.ticket.content.toLowerCase()).includes(this.state.search.toLowerCase()) : null);

			return (<ul className='tickets'>
			{filteredTickets.map((ticket) => (<li style = {{display:ticket.hide?"none":"block"}} id={ticket.ticket.id} key={ticket.ticket.id} className='ticket'>
				<div><a style={{width: 40}} id={ticket.ticket.id} onClick = {(e) => this.hideOrShowTicket(ticket.ticket.id)}>Hide</a></div>
				<h5 className='title'>{ticket.ticket.title}</h5>
				<div><h5  className='content'>{ticket.ticket.content.length > 440?!ticket.showMore?ticket.ticket.content.slice(0,440)+'...':ticket.ticket.content:ticket.ticket.content}</h5>
				{ticket.ticket.content.length > 440? 
				<a id = {ticket.ticket.id + 'more'} onClick={(e) => this.moreOrLessContent(ticket.ticket.id)}>{!ticket.showMore?"show more":"show less"}</a>:null}</div>
				<footer>
					<div className='meta-data'>By {ticket.ticket.userEmail} | { new Date(ticket.ticket.creationTime).toLocaleString()}</div>
					<div>{ticket.ticket.labels? ticket.ticket.labels.map((label) => <button className='tag' disabled>{label}</button>):null}</div>	
				</footer>
			</li>))}
		</ul>);
	}
	hideOrShowTicket = async (id:string) => {;
		this.setState
		({
			countHidden: this.state.countHidden + 1,
			tickets: this.state.tickets?this.state.tickets.map((t) => {
				var ticket: TicketState = {
					ticket: t.ticket,
					hide: t.ticket.id == id? !t.hide: t.hide,
					showMore: t.showMore
				}
				return ticket;
			}):this.state.tickets
		});
	}
	moreOrLessContent = async (id:string) => {
		this.setState
		({
			tickets: this.state.tickets?this.state.tickets.map((t) => {
				var ticket: TicketState = {
					ticket: t.ticket,
					hide: t.hide,
					showMore: t.ticket.id == id? !t.showMore: t.showMore
				}
				return ticket;
			}):this.state.tickets
		});
	}
	onSearch = async (val: string, newPage?: number) => {

		clearTimeout(this.searchDebounce);

		this.searchDebounce = setTimeout(async () => {
			this.setState({
				search: val
			});
		}, 300);
	}

	showAll = async (tickets: TicketState[]) => {
		tickets = tickets.map((t) => {
			const ticket: TicketState = {
				ticket: t.ticket,
				hide: false,
				showMore: t.showMore
			}
			return ticket;
		})
		this.setState({ tickets: tickets,
			countHidden: 0 });
	}
	nextPage(next: boolean) {
		this.setState({page: next ? this.state.page + 1 : this.state.page - 1,
		countHidden: 0});
	}

	sortByFunc(sort: string){
		this.setState({sortBy: sort});
	}
	render() {
		const { tickets } = this.state;
		return (<main>
			<h1>Tickets List</h1>
			<header>
				<input type="search" placeholder="Search..." onChange={(e) => this.onSearch(e.target.value)} />
			</header>
			<div>
				<a className='blue-btn' onClick={(e) => this.sortByFunc('date')}>sort by date</a>
				<a className='blue-btn' onClick={(e) => this.sortByFunc('title')}>sort by title</a>
				<a className='blue-btn' onClick={(e) => this.sortByFunc('email')}>sort by email</a>
			</div>
			{tickets ? <div className='results'>Showing {tickets.length} results
			{this.state.countHidden !== 0? <i className='results'>(<text>{this.state.countHidden}</text> hidden tickets -
				<a style={{ cursor: 'pointer' }} onClick={(e) => tickets ? this.showAll(tickets) : null}>restore</a>)</i>:null}</div> : null}

			{tickets ? this.renderTickets(tickets) : <h2>Loading..</h2>}
			{tickets && tickets.length != 0 ? <a className='blue-btn' onClick={(e) => this.nextPage(true)}>next</a> : <h2>no more tickets</h2>}
			{this.state.page != 1 ? <a className='blue-btn' onClick={(e) => this.nextPage(false)}>prev</a> : null}
		</main>)
	}
}

export default App;