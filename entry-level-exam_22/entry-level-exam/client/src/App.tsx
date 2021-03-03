import React from 'react';
import './App.scss';
import {createApiClient, Ticket} from './api';
export type AppState = {
	tickets?: Ticket[],
	search: string,
	moreTickets?: Ticket[]
}

const api = createApiClient();

export class App extends React.PureComponent<{}, AppState> {
	state: AppState = {
		search: '',
		tickets: [],
		moreTickets: []
	}
	countHidden = 0;
	searchDebounce: any = null;
	page = 1;
	sortBy = ''
	async componentDidMount() {
		this.setState({
			tickets: await api.getTickets(this.page,this.sortBy)
		});
	}
	
	renderTickets = (tickets: Ticket[]) => {
		const filteredTickets = tickets
			.filter((t) => (t.title.toLowerCase() + t.content.toLowerCase()).includes(this.state.search.toLowerCase()));

		return (<ul className='tickets'>
			{filteredTickets.map((ticket) => (<li id={ticket.id} key={ticket.id} className='ticket'>
				<div><a style={{display: "block",width: 40}} id={ticket.id} onClick = {(e) => this.hide(ticket.id)}>Hide</a></div>
				<h5 className='title'>{ticket.title}</h5>
				<div><h5 id={ticket.id + 'content'} className='content'>{ticket.content.length > 440?ticket.content.slice(0,440)+'...':ticket.content}</h5>
				{ticket.content.length > 440? 
				<><a id = {ticket.id + 'more'} onClick={(e) => this.showMoreOrLess('more', ticket.id, ticket.content)}>show more</a>
				<a id = {ticket.id + 'less'} style={{ display: 'none' }} onClick={(e) => this.showMoreOrLess('less', ticket.id, ticket.content)}>show less</a></>:null}</div>
				<footer>
					<div className='meta-data'>By {ticket.userEmail} | { new Date(ticket.creationTime).toLocaleString()}</div>
					<div>{ticket.labels? ticket.labels.map((label) => <button className='tag' disabled>{label}</button>):null}</div>	
				</footer>
			</li>))}
		</ul>);
	}
	
	onSearch = async (val: string, newPage?: number) => {
		
		clearTimeout(this.searchDebounce);

		this.searchDebounce = setTimeout(async () => {
			this.setState({
				search: val
			});
		}, 300);
	}
	hide(id:string){
		var ticket = document.getElementById(id.toString());
		if (ticket != null)
			ticket.style.display = 'none';
		this.countHidden = this.countHidden + 1;
		var counter = document.getElementById('counter');
		if (counter != null)
			counter.innerHTML =this.countHidden.toString();
	}
	showAll(tickets:Ticket[]){
		this.countHidden = 0;
		var counter = document.getElementById('counter');
		if (counter != null)
			counter.innerHTML ='0' 
		var ticket;
		for (var i = 0; i < tickets.length; i++){
			ticket = document.getElementById(tickets[i].id.toString());
			if(ticket != null && ticket.style.display === 'none')
				ticket.style.display = 'block';
		}
		}
		next(next:boolean){
			next ? this.page = this.page + 1:this.page = this.page - 1;
			this.countHidden = 0;
			var counter = document.getElementById('counter');
			if (counter != null)
				counter.innerHTML ='0'
			this.componentDidMount()
		}
	
		sortByFunc(sort:string){
			this.sortBy = sort;
			this.componentDidMount();
		}
		showMoreOrLess(choice:string,id:string,cont:string){
			var content = document.getElementById(id + 'content');
			var buttonMore = document.getElementById(id + 'more');
			var buttonLess = document.getElementById(id + 'less');
			if (content != null) {
				if (choice == 'more'){
					content.innerHTML = cont;
					if (buttonLess) buttonLess.style.display = 'block';
					if (buttonMore) buttonMore.style.display = 'none';
				}
				else
				{
					content.innerHTML = cont.slice(0,440);
					if (buttonLess) buttonLess.style.display = 'none';
					if (buttonMore) buttonMore.style.display = 'block';
				}
			}
		}
	render() {	
		const {tickets} = this.state;
		return (<main>
			<h1>Tickets List</h1>
			<header>
				<input type="search" placeholder="Search..." onChange={(e) => this.onSearch(e.target.value)}/>
			</header>
			<div>
				<a className = 'blue-btn' onClick={(e) => this.sortByFunc('date')}>sort by date</a>
				<a className = 'blue-btn' onClick={(e) => this.sortByFunc('title')}>sort by title</a>
				<a className = 'blue-btn'  onClick={(e) => this.sortByFunc('email')}>sort by email</a>
			</div>
			{tickets ? <div className='results'>Showing {tickets.length} results
			<i className='results'>(<text id='counter'>{this.countHidden}</text> hidden tickets - 	
				<a style={{cursor: 'pointer'}} onClick={(e) =>tickets ? this.showAll(tickets):null}>restore</a>)</i></div> : null }

			{tickets ? this.renderTickets(tickets) : <h2>Loading..</h2>}
			{tickets && tickets.length != 0  ? <button onClick={(e)=>this.next(true)}>next</button>:<h2>no more tickets</h2>}
			{this.page != 1 ? <button onClick={(e)=>this.next(false)}>prev</button>:null}
		</main>)
	}
}

export default App;