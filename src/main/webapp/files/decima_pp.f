cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
c    <Inference of quantitative & data driven networks in biological systems using
c    BP-based Decimation Algorithm with and without prior information>
c    Copyright (C) 2015  MSKCC, Authors: Chris Sander, Anil Korkut
c
c
c    This program is free software: you can redistribute it and/or modify
c    it under the terms of the GNU General Public License as published by
c    the Free Software Foundation, either version 3 of the License, or
c    (at your option) any later version.
c
c    This program is distributed in the hope that it will be useful,
c    but WITHOUT ANY WARRANTY; without even the implied warranty of
c    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
c    GNU General Public License for more details.
c
c    You should have received a copy of the GNU General Public License
c    along with this program.  If not, see <http://www.gnu.org/licenses/>.
cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
c
c	decimation/BP algorithm for network inference from perturbation data
c       
c       Hopfield network models and perturbation
c       model XDATA'=beta*phi(sigma(Jij*Xj)+Ui)-apha*XDATA
c
c	last updated 01/11 a.korkut/ sander lab @ mskcc akorkut@cbio.mskcc.org
c       
c	
ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
       program bp decimation
c       parameter(nnodem=1000)
       include "common.main"

c	read the input file
       read(5,"(10x,I5)")NEXPTS
       read(5,"(10x,i5)")NNODES                                            
       read(5,"(10x,I5)")Nwvals
       read(5,"(10x,E8.2)")Wijmax
       read(5,"(10X,E8.2)")thresh
       read(5,"(10x,F5.2)")lambda
       read(5,"(10x,F5.2)")beta
       read(5,"(10x,i5)")n_obs
       read(5,"(10x,i5)")n_vax
       read(5,"(10x,i5)")n_pri
       read(5,"(10x,i5)")n_dec
       read(5,"(10x,i5)")n_exx
c       read(5,"(10x,i5)")nexpcg
cccccccccccccccccccccccccccccccccccccccccccccccccccc       
c      open and read the input files
c      prio.txt: prior information file
c      data.txt: protein readouts (rows: experiment, column: protein readout
c      pert.txt: perturbations
c      node_index.txt: name of nodes, 1 -> used in calculations 0 ->omittef
c set to exclude nodes !! to be done!!        

       open(7,file='data.txt')
       open(2,file='pert.txt')
       open(8,file='node_index.txt')
       open(10,file='gamma.txt')
       open(11,file="exp_index.txt")       
       

cccccc read the response data file       
       do i=1,n_exx
       read(7,*)(XDATAi(j,i),j=1,n_vax)       
       read(2,*)(UDATAi(j,i),j=1,n_vax)
       enddo

cccc index nodes (node names)
ccc  first column:protein names
ccc	 second column: 1: node included in calculation	0: node not included
ccc  third column: node type 1: proteomic 2: phenotypic 3: activity (drug coupling node)
       do i=1,n_vax
       read(8,*)protnamei(i),in(i),ntypo(i)
       enddo
       
        indr=0
        do i=1,n_vax 
        if(in(i).eq.1)then
        protname(i-indr)=trim(adjustl(protnamei(i)))
        ntyp(i-indr)=ntypo(i)
        endif

        do j=1,n_exx
        if(in(i).eq.1)then
        XDATAe(i-indr,j)=(XDATAi(i,j))
        UDATAe(i-indr,j)=UDATAi(i,j)
        endif
        enddo
        indr=indr+(1-in(i))
        enddo
        

ccccccccccccccccccccccccccc
cc index exp
cc 1st column: experiment name(not use)
cc 2nd column 1: experiment included in calculations 0: experiment not included

       expcg=0
       do i=1,n_exx
       read(11,"(15x,i1,3x,i1)")inx(i)
       enddo
       
        do i=1,NNODES
        indx=0
        do j=1,n_exx
        if(inx(j).eq.1)then  
        XDATA(i,j-indx)=XDATAe(i,j)
        UDATA(i,j-indx)=UDATAe(i,j)
        endif
        indx=indx+(1-inx(j)) 
        enddo       
        enddo   
c compute alhpa/beta 
        do mu=1,NEXPTS
        do i=1,NNODES
        xdiabs(i,mu)=abs(XDATA(i,mu))
        enddo
        enddo

       do i=1,NNODES
       alb(i)=0.91/maxval(xdiabs(i,1:NEXPTS))
       write(*,*)protname(i),alb(i),maxval(xdiabs(i,1:NEXPTS))
       write(10,*)protname(i),alb(i)
       enddo

ccccccccccccccccccccccccccccccccccccccccccccccccccccccc
c    compute possible semi-discrete Wij values using NWVALS and Wijmax

       do i=1,NWVALS

       Wvals(I)=2*Wijmax*(i-0.5*(NWVALS+1))/(NWVALS-1)
       enddo
ccccccccccccccccccccccccccccccccccccccccccccc	

ccccccccccccccccccccccccccccccccccccccccccccc       

c start decimation loop   
       call decimation
     :(n_dec,NWVALS,n_obs,Wvals,XDATA,alb,UDATA,protname,nnodes
     :,n_pri,thresh,beta,lambda,NEXPTS,wijmax,ntyp)
       end
cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
      subroutine decimation
     :(n_dec,NWVALS,n_obs,Wvals,XDATA,alb,UDATA,protname,nnodes
     :,n_pri,thresh,beta,lambda,NEXPTS,wijmax,ntyp)
      include "common.bp2"
             include "common.main"
      integer i_u(nnodes)
      open(56,file="decimation_output.txt")
      open(57,file="decimation_nonzero_edges.txt")
          n_var=NNODES-1
          n_deci=n_obs*n_var
c initial Bp
      

cccccccccccccccccccccccccccc          
   	    do round=1,n_dec
115         continue
cccccccccccccccccccccccccccccccc
c	MARGINALSENT FILE HAS THE BP GENERATED P(WIJ) FOR ALL IJ	CCC
          open(4,file="marginals.ent")
          
          do i=1,nnodes
           do j=1,nnodes
           wij(i,j)=0
           enddo
         enddo
          do i=1,n_obs
          TARGET_NODE=i
          write(4,*)TARGET_NODE,protname(i)
c subroutine for dilution and prior
C CURRENT FORM INCLUDES THE STEP FUNCTION ONLY
C OTHER PRIOR FORMS (GAUSSIAN ETC) WILL BE INCLUDED
c        write(*,*)"target",TARGET_NODE,"started"
         call dil_prior
     :(n_pri,NEXPTS,NNODES,TARGET_NODE,lambda,
     :protname,name_i,name_ii,pent,XDATA,x_i,UDATAx,UDATA,
     :xo,Wvals,NWVALS,ntyp,ntyx)    
    
ccccccccccccccccccccccccccccccccccccccccccccc
c initial BP run for all targets         
        

        deci=1
       call BP(name_i,TARGET_NODE,n_deci,deci,bm,cm,pwijo,
     :NEXPTS,nnodes,NWVALS,beta,
     :lambda,xo,UDATAx,x_i,thresh,Wijmax,
     :dmax,alb,Wvals,n_obs,pent,ntyx) 
     	write(4,"(14x,1000F12.2)")
     :(2*Wijmax*(ii-0.5*(NWVALS+1))/(NWVALS-1),ii=1,NWVALS)
C	EXCLUDE NONCONVERGENT MESSAGES FROM CALCULATIONS	RE-RUN DECIMATION STEPS TO RESAMPLE FOR CONVERGENCE
       do ii=1,n_var
           do k=1,NWVALS
           if(pwijo(i,ii,k)/=pwijo(i,ii,k))then

            pwijo(i,ii,k)=0

           endif
           enddo
CCCCCCCCCCCCCCCCCCCC
       write(4,"(A11,3x,1000F12.8)")
     :name_i(ii),(pwijo(i,ii,k),k=1,NWVALS)
       enddo
         
 
        enddo
        close(4)
ccccccccccccccccccccccccccc                
	   write(*,*)"round",round
       do deci=1,n_deci
      
       do i=1,n_obs
         TARGET_NODE=i 

      
cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
c carry all from round 0      
        
c      at first decimation step initial BP marginals are set.        
       if(deci.eq.1)then
       do ii=1,n_var
       do kk=1,NWVALS
       pwij(TARGET_NODE,ii,kk)=pwijo(TARGET_NODE,ii,kk)
       enddo
       enddo
       endif            
       
ccccccccccccccccccccccccccccc     
c   call BP for a target J TO UPDATE ALL P(WIJ) if an edge UPSTREAM OF J
cis fixed at A previous decimation step         
c        if(cm(deci-1).eq.TARGET_NODE.and.deci.gt.1)then
C	SPPED OPTIMIZATION:
c the code can be modified to make it faster than it is now.
c here it is set to "run BP if pmto(deci-1,dmax(deci-1)).le.1.0"
c for example if you set it to  "pmto(deci-1,dmax(deci-1)).le.0.95" 
c we will call bp only if there is a significnat change to the probability landscape 
c or BP has not beedn called for more than 5 steps (i_u defines call freuency)
   
          
        if(cm(deci-1).eq.TARGET_NODE.and.deci.gt.1.and.
     :(pmto(deci-1,dmax(deci-1)).le.0.95.or.
     :i_u(target_node).eq.5))then
c       print*,"BP update",DECI
         call dil_prior
     :(n_pri,NEXPTS,NNODES,TARGET_NODE,lambda,
     :protname,name_i,name_ii,pent,XDATA,x_i,UDATAx,UDATA,
     :xo,Wvals,NWVALS,ntyp,ntyx)
       if(i_u(target_node).eq.5)i_u(target_node)=0
       call BP(name_i,TARGET_NODE,n_deci,deci,bm,cm,pwij,
     :NEXPTS,nnodes,NWVALS,beta,
     :lambda,xo,UDATAx,x_i,thresh,Wijmax,
     :dmax,alb,Wvals,n_obs,pent,ntyx)
       else
       if(cm(deci-1).eq.TARGET_NODE.and.deci.gt.1)then
       i_u(target_node)=i_u(target_node)+1
       endif
       endif

c   write the marginals for unfixed edges and the fixed edge as p(wij=omega)=1 
           open(55,file='temp_marg.txt')
           do ii=1,n_var
	   write(55,"(2i5,11F8.4,i5)")
     :ii,TARGET_NODE,(pwij(TARGET_NODE,ii,k),k=1,NWVALS),deci
       DO k=1,NWVALS
       if(pwij(TARGET_NODE,ii,k)/=pwij(TARGET_NODE,ii,k))THEN 

       pwij(TARGET_NODE,ii,k)=0

       endif
       enddo
           enddo           
       
       enddo
       
       close(55)
       
       open(55,file='temp_marg.txt')
c select a marginal and fix       

cavoid the already fixed edges by assigning them a temporary P=0 for all Wij

        DO III=1,n_obs
          do iiii=1,n_var
          bb((iii-1)*n_var+iiii)=iiii
          cc((iii-1)*n_var+iiii)=iii          
           do kk=1,Nwvals
            pmtm((iii-1)*n_var+iiii,kk)=pwij(iii,iiii,kk)
          enddo
        enddo
      enddo 
       do ii=1,n_deci
       do iii=1,deci-1
        if(bb(ii).eq.bm(iii).and.cc(ii).eq.cm(iii))then
        do kk=1,NWVALS
        pmtm(ii,kk)=0
        enddo

        endif
        enddo
   	   enddo
	    do ii=1,n_deci
        do iii=1,nwvals
        pmt(ii,iii)=pmtm(ii,iii)
        enddo
       enddo
ccccccccccccccccccccccc	   
 	
112    continue   

ccccccccccccccccccccccccccccccccc
c   margsel fixes an edge with a draw. 
c	Probability of fixing an edge is the marginal P value divided 
c	by number of edges 
ccccccccccccccccccccccccccc    
c	pmtm is the marginal values,
c   pms is the marginal of the fixed at edge value
c   iix is the index of the value of  fixed edge 
c   ix iis the index of the fixed edge (equal to the row number on fort.55) 

       call margsel
     :(nnodes,nexpts,n_deci,NWVALS,pmt,deci,iix,ix,conflag)
      if(conflag.eq.1)then
      continue
      else
      if(conflag.eq.0)then
      write(*,*)"con_flag is 0"
      go to 116
      endif
      ENDIF      
cpmax(deci) not used
c      bb and cc are the node indexes as read from fort.55
c      bm and cm are the node indexes fixed at decimation step "deci"
c      iix is the index of the fixed edge on fort.55
c      dmax(deci) is the corresponding index for decimation step "deci"
c      pmtm and pmto are the marginal distributions of the selected edge
c      pmtm is indexed in decimation steps, pmtm is indexed as in fort.55  
c       bm(deci)=bb(ix)
c       cm(deci)=cc(ix)
        cm(deci)=int(((ix-1)/n_var))+1
        bm(deci)=ix-(n_var*(CM(DECI)-1))


       dmax(deci)=iix
c	to be removed
       if(dmax(deci).ne.6)then
       if(name_ii(bm(deci),cm(deci)).eq."Apoptosis  ".or.
     :name_ii(bm(deci),cm(deci)).eq."G1_arrest  ".or.
     :name_ii(bm(deci),cm(deci)).eq."G2_arrest  ".or.
     :name_ii(bm(deci),cm(deci)).eq."S_arrest   ".or.
     :name_ii(bm(deci),cm(deci)).eq."G2M        ")then

       print*,"phenotype alert"
       write(99999,*)"phenotype alert"
     :,deci,ix,iix,bm(deci),bb(ix),cm(deci),cc(ix),dmax(deci) 
       go to 134
       endif
       endif
c       cccccccc
       do kk=1,NWVALS
       pmto(deci,kk)=pmtm(ix,kk)       
       enddo
       close(55)   
ccccccccccccccccccccccccccccccc

              
c	writing outputs       
c	fort.56 is the marginal distributions of all edges prior to being 
c	fixed in all solutions
c	fort.57 is all the non-zero fized edges in all solution
       if(deci.eq.1)then
       write(56,*)"round",round       
       endif

       if(bm(deci).gE.cm(deci))then
       wij(bm(deci)+1,cm(deci))=Wvals(dmax(deci))

       else
       wij(bm(deci),cm(deci))=Wvals(dmax(deci))

       endif
       
       write(56,"(5i7,2A11,1000F12.8)")
     :round,deci,bm(deci),cm(deci),dmax(deci),name_ii(bm(deci),
     :cm(deci)),
     :protname(cm(deci)),
     :(pmto(deci,kkk),kkk=1,NWVALS),Wvals(dmax(deci))


      if(deci.gt.1.and.Wvals(dmax(deci)).ne.0)then
      write(57,"(3i5,2A11,2x,i5,2x,i5,F12.8)")
     :round,deci,dmax(deci),name_ii(bm(deci),cm(deci)),
     :protname(cm(deci)),bm(deci),cm(deci),Wvals(dmax(deci))
c      write(*,"(3i5,2A11,2x,i5,2x,i5,F12.8)")
c     :round,deci,dmax(deci),name_ii(bm(deci),cm(deci)),
c     :protname(cm(deci)),bm(deci),cm(deci),Wvals(dmax(deci))
c      write(*,"(2A11,2F12.2)")name_ii(bm(deci-1),cm(deci-1)),
c     :protname(cm(deci-1)),pent(bm(deci-1),dmax(deci-1)),
c     :-log(pent(bm(deci-1),dmax(deci)))
      endif

c      ggg=ggg+1

      if(deci.eq.n_deci)then
      write(*,*)"round terminated"
c	compute error of the solution      
116   CONTINUE!MAY BE INCLOMPLETE SOLUTION
       call
     :erro(deci,bm,cm,NNODES,je,dmax,alb,
     :NWVALS,NEXPTS,XDATA,Wvals,UDATA,
     :errorm,n_obs,errorm2,errorm3)
     
      write(56,"(A6,9x,2F12.4)")"error=",errorm(deci),errorm2(deci)
      write(*,*)"error=",errorm(deci),errorm2(deci),errorm3(deci)
	  write(61,*)round,errorm3(deci)
      go to 133

c      go to 111		!margsel
      endif
       
       enddo 
       
133    continue

ccccc write wij
ccccccccccccccc
c	   prepare input files for grad descent
c      1.command file
c	2.options file with initial parameters+matrix+alpha+beta
c	3.topology file

ccccccccccccccc	
c        call prep_data(xdata,udata,nexpcg,nnodes,nexpts,n_obs)

        call prep_cg(NNODES,NEXPCG,round,wij,alb,n_obs)
c       call pineda()       
       
       enddo    
134    continue       
        end 
cccccccccccccccccccc       
      subroutine BP(name_i,TARGET_NODE,n_deci,deci,bm,cm,pwij,
     :NEXPTS,nnodes,NWVALS,beta,
     :lambda,xo,UDATAx,X_i,threshold,Wijmax,
     :dmax,alb,Wvals,n_obs,pent,ntyx)
       include "common.bp2"
              include "common.main"
                     
       n_var=nnodes-1

                   

c initial rho is chosen randomly. 
c--

       call random(s)
	   do i=1,n_var
	   do mu=1,NEXPTS
	   do k=1,NWVALS
           rho(i,mu,k)=s(i*mu)   
	   enddo
	   enddo
	   enddo
	   
c	normalize initial rho message	cccccccccccc
	   do i=1,n_var
	   do mu=1,NEXPTS
	   sumirho(i,mu)=sum(rho(i,mu,1:NWVALS))
	   enddo
	   enddo   	   
	   do i=1,n_var
	   do mu=1,NEXPTS
	   do k=1,NWVALS
           rho(i,mu,k)= rho(i,mu,k)/sumirho(i,mu)  
           rho_tm1(i,mu,k)=rho(i,mu,k)
	   enddo
	   enddo
	   enddo
cccccccccccccccccccccccccccccccccccccccccccccccc
c	compute initial total field
            do i=1,n_var
            do k=1,NWVALS
           TotalField(i,k)=product(rho(i,1:NEXPTS,k))*pent(i,k)
c            if(TARGET_NODE.eq.80)then
c            print*,i,k,pent(i,k),TotalField(i,k)
c            endif
           enddo
           enddo
           
c--3
C	INITIATE THE MESSAGE PASSING ITERATIONS
10000    continue
c         outer  BP loop
         do fff=1,5000
ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
c--4
               call randpermx(NEXPTS, myperm)
               call randpermx(n_var, myperm2)
               
c        compute stdev and mean values for gaussian
           DO mu=1,NEXPTS

           jp=myperm(mu)
cccccccccccccccccccccccccccccccccccccccccccccccccccccccc           
c	compute mean field parameters and update the p messeges
           call gauss_par
     :(dmax,jp,nnodes,NEXPTS,Wvals,NWVALS,stddev_ij,
     :hmean_ij,X_i,rho,lambda,TARGET_NODE,n_deci,deci,bm,cm,pmn,
     :TotalField,name_i,ntyx)

c	compute & update the total field and rho messages
      call rhoupdate
     :(hmean_ij,stddev_ij,jp,Wvals,X_i,xo,alb,
     :UDATAx,beta,rho,TotalField,nnodes,NWVALS,myperm2,
     :TARGET_NODE,rho_tm1,nexpts)
cccccccccccccccccccccccccccccccccccccccccccccccccccccc     
            enddo
c	change of rho message since the precious update            
         do i=1,n_var
          do mu=1,NEXPTS
           do k=1,NWVALS
  
         DELTARHO(I,mu,K)=ABS(rho(I,mu,K)-rho_tm1(I,mu,K))
c         if(target_node.eq.80)then
c         write(*,*)rho(I,mu,K),rho_tm1(I,mu,K)
c         endif
           enddo
          enddo
         enddo

cccccccccccccccccccccccccccccccccccccccccccccc
c--12
C	COMPUTE MAXDELTARHO AND CONVERGENCE CRITERIA.	
c--   	   
	   maxdeltarho=maxval(deltarho(1:n_var,1:NEXPTS,1:NWVALS))

c	   write(*,*)"maxdeltarho  ",fff,maxdeltarho
                                
	   if(maxdeltarho.lt.threshold)then
       go to 1000 ! leave the outer BP loop (maxdeltarho converged)
	   else
	   endif
cccccccccccccccccccccccccccccccccccccccccccccccc
c	assign rho to rho_tm1
       do I=1,N_VAR
	    DO mu=1,NEXPTS
         do k=1,NWVALS

           rho_tm1(i,mu,k)=rho(i,mu,k)

         enddo
        enddo
       enddo
ccccccccccccccccccccccccccccccccccccccccccccccc       
	   enddo ! end of outer BP loop
1000   continue ! to compute final marginals for this BP round	   
c--13
c	compute NORMALIZED marginals
c--

	   do i=1,N_var
	   sumpm(i)=0
           
	   DO K=1,NWVALS
       pmar(i,k)=0
	   Pmar(i,k)=TotalField(i,k)
       sumpm(i)=sumpm(i)+(pmar(i,k)) 
	   ENDDO
	   ENDDO

	   do i=1,N_var
	   DO K=1,NWVALS

	   Pmn(i,k)=pmar(i,k)/sumpm(i) 
CC IMPORTANT: we still ban edges downstream of phenotypes. 
ccThis is to consider responses to changes to cell viability.	   
c	the fixed edges have P(wij=omega)=1
	   if(ntyx(i).eq.2)then
	   if(k.eq.6)then
	   pmn(i,k)=1d0
	   else
	   pmn(i,k)=0d0
	   endif
	   endif
ccccccccccccccccccccccccc
	       do ii=1,deci-1
           if(TARGET_NODE.eq.cm(ii))then
           if(k.eq.dmax(ii))then 
           pmn(bm(ii),k)=1
           else
           pmn(bm(ii),k)=0
           endif
           endif
           enddo
ccccccccccccccccccccccccccccccccccccccccccccccc
	       ENDDO  
           do k=1,NWVALS
           pwij(TARGET_NODE,i,k)=pmn(i,k)
           enddo
   	   
	       ENDDO

c--     

      
	   END
         
ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
C	update factor messages-compute mean and stdv	  
ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc

	   subroutine gauss_par
     :(dmax,jp,nnodes,NEXPTS,Wvals,NWVALS,stddev_ij,
     :hmean_ij,X_i,rho,lambda,TARGET_NODE,n_deci,deci,bm,cm,pmn     
     :,TotalField,name_i,ntyx)

       
       include "common.bp2"
              include "common.main"
       n_var=nnodes-1    
	   do I=1,N_VAR
	   sump(i,jp)=0
       DO K=1,NWVALS
	   Pwij_mu(i,jp,k)=(1/(rho(i,jp,k)))*TotalField(i,k)
c	   if(target_node.eq.80)then
c	   print*,Pwij_mu(i,jp,k),rho(i,jp,k),TotalField(i,k)
c	   endif
c phenotypic upstream 
	   if(ntyx(i).eq.2)then
	   if(k.eq.6)then
	   Pwij_mu(i,jp,k)=1d0
	   else
	   Pwij_mu(i,jp,k)=0d0
	   endif
	   endif	 
	   ENDDO
	   ENDDO

c	the fixed edges should have P(wij=omega)=1
           do ii=1,deci-1
           
           if(TARGET_NODE.eq.cm(ii))then
           do k=1,NWVALS
           if(k.eq.dmax(ii))then 
           pwij_mu(bm(ii),jp,k)=1
           else
           pwij_mu(bm(ii),jp,k)=0
           endif
           enddo
           endif
           enddo   
ccccccccccccccccccccccccccccccccccccccccccccc
           do I=1,N_VAR
           sump(i,jp)=sum((pwij_mu(i,jp,1:NWVALS)))
           enddo

           do I=1,N_VAR
	       DO K=1,NWVALS
           pwij_mu(i,jp,k)=pwij_mu(i,jp,k)/sump(i,jp)
           pj(i,jp,k)=pwij_mu(i,jp,k)*Wvals(k)
           pjj(i,jp,k)=pwij_mu(i,jp,k)*Wvals(k)**2
           enddo
           enddo
           do I=1,N_VAR
           SUMPJUJV(I,Jp)=0
           SUMPJUJV2(I,Jp)=0
           SUMPJU(I,Jp)=0           
	       
           SUMPJUJV(I,Jp)=SUM(pj(i,jp,1:nwvalS))!-pjt(i,jp,k)
           SUMPJUJV2(I,Jp)=SUM(pjj(i,jp,1:nwvalS))!-pjjt(i,jp,k)
           SUMPJU(I,Jp)=SUM(Pwij_mu(I,Jp,1:nwvalS))!-pt(i,jp,k)
           ENDDO  
           
           
            
           
           do I=1,N_VAR
	       DO K=1,NWVALS
           pjt(i,jp,k)=pj(i,jp,k)
           pjjt(i,jp,k)=pjj(i,jp,k)
           pt(i,jp,k)=pwij_mu(i,jp,k)
           ENDDO
           ENDDO

ccccccccccccccccccccccccccccccc
	   DO I=1,N_VAR
	   JAVG(I,Jp)=SUMPJUJV(I,Jp)/SUMPJU(I,Jp)
	   XJ(I,Jp)=X_i(I,Jp)*JAVG(I,Jp)
	   J2AVG(I,Jp)=SUMPJUJV2(I,Jp)/SUMPJU(I,Jp)
	   X2J2(I,Jp)=(X_i(I,Jp)**2)*(J2AVG(I,Jp)-JAVG(I,Jp)**2)

	   ENDDO

	   
	   hmean(Jp)=0d1
	   stddev(Jp)=0d1
	   
	   hmean(Jp)=SUM(XJ(1:N_VAR,Jp))
	   stddev(Jp)=SUM(X2J2(1:N_VAR,Jp))
	   
      
 
	   DO I=1,N_VAR
	   hmean_ij(I,Jp)=(hmean(Jp)-XJ(I,Jp))
	   stddev_ij(I,Jp)=(stddev(Jp)-X2J2(I,Jp))

	   ENDDO
           return  
           end
cccccccccccccccccccccccccccccccccc
c--15 random number generator   
cccccccccccccccccccccccccccccccccc   
       subroutine random(s)
       DOUBLE PRECISION s(5000000)            ! Declare the type of the rand() function
       integer i                 ! Counts random numbers
       integer*4 timeArray(8)    ! Holds the hour, minute, and second
c--
c In order to get a different sequence each time, we initialize the
c seed of the random number function with the sum of the current
c hour, minute, and second.
c--
      call date_and_time(values=timeArray)     ! Get the current time
      i = rand ( timeArray(8))
c--
c Calling rand() with an argument of zero generates the next number
c in sequence.
c--
      do i = 1,500000
      
      s(i)=rand(0)
c      write(*,*)s(i)
      end do

      return
      end

cccccccccccccccccccccccccccccccccccccccccccccccccc
c     generates a random permutation of integers
ccccccccccccccccccccccccccccccccccccccccccccccccccc
      subroutine randpermx(num, myperm)

      integer  :: num
      integer myperm(num),timearray(8)

      integer :: mynumber, i, j, k
      real rand2(num)

      call date_and_time(values=timeArray)     ! Get the current time
      i = rand ( timeArray(8))
      do i=1,num
      rand2(i)=rand(0)
      enddo

      do i=1,num
        mynumber=1
      do j=1,num
       if (rand2(i) > rand2(j)) then
      mynumber = mynumber+1
      end if
      end do
      do k=1,i-1
      if (rand2(i) <= rand2(k) .and. rand2(i) >= rand2(k)) then
      mynumber = mynumber+1
      end if
      end do
      myperm(i) = mynumber
      end do
      return
      end
c	subroutine for probabilistic selection of an edge to be fixed
       subroutine 
     :margsel(nnodes,nexpts,b_dec,NWVALS,pmt,ggg,iix,ix,conflag)
       include "common.bp2"
       include "common.main"
       double precision PMIND(b_dec*NWVALS),INTP(B_DEC*NWVALS+1)
       integer ix,iix
c      define intervals for each marginal value      
       conflag=0
       do i=1,b_dec
        do ii=1,NWVALS
        iii=(i-1)*NWVALS+ii
        pmind(iii)=pmt(i,ii)
       enddo
       enddo
       intp(1)=0
       do iii=2,NWVALS*b_dec+1
       intp(iii)=intp(iii-1)+pmind(iii-1)
c       write(*,*)"int",intp(iii)
       enddo
       normin=sum(intp(1:NWVALS*b_dec+1))
     
       do iii=1,NWVALS*b_dec+1
       intp(iii)=intp(iii)/intp(NWVALS*b_dec+1)
       enddo

        call random(s)

        do iii=2,NWVALS*b_dec+1
        if(s(ggg).gt.intp(iii-1).and.s(ggg).le.intp(iii))then
        conflag=1
        ix=int((iii-2)/NWVALS)+1
c        print*,ix,s(ggg),intp(iii-1),intp(iii),iii
        iix=(iii-1)-(ix-1)*NWVALS
c        if(iix.eq.0)then
c        iix=NWVALS
 
c        endif
         GO TO 333    
        endif
          
        enddo
333     CONTINUE   

c         pms=pmt(ix,iix)
         return
         end
         
      
       subroutine
     :erro(deci,bm,cm,NNODES,je,dmax,alb,
     :NWVALS,NEXPTS,XDATA,Wvals,UDATA,
     :errorm,n_obs,errorm2,errorm3)

       include "common.bp2"
              include "common.main"
 
       do i=1,deci
       if(bm(i).lt.cm(i))then
   	   je(bm(i),cm(i))=Wvals(dmax(i))
       else if(bm(i).ge.cm(i))then
       je(bm(i)+1,cm(i))=Wvals(dmax(i))
       endif
       enddo

       do i=1,n_obs
       do mu=1,NEXPTS
      err(i,mu)=(atanh(XDATA(i,mu)*alb(i))-
     :sum(XDATA(1:NNODES,mu)*je(1:NNODES,i)))**2
	  err2(i,mu)=(XDATA(i,mu)-tanh(
     :sum(XDATA(1:NNODES,mu)*je(1:NNODES,i)))/alb(i))**2
       enddo 	   
       enddo
         
       do i=1,n_obs
       error(i)=sum(err(i,1:NEXPTS))/NEXPTS
	   error2(i)=sum(err2(i,1:NEXPTS))/NEXPTS
       enddo
       
       errorm(deci)=(sum(error(1:n_obs)))
     :+0.01*sum(abs(je(1:NNODES,1:n_obs)))

       errorm2(deci)=(sum(error(1:n_obs)))
     :+0*sum(abs(je(1:NNODES,1:n_obs)))
	 	errorm3(deci)=(sum(error2(1:n_obs)))
     :+0.01*sum(abs(je(1:NNODES,1:n_obs)))
       end
c	subroutine for priors and complexity term
c	gaussian term to be included       
       subroutine dil_prior
     :(n_pri,NEXPTS,NNODES,TARGET_NODE,lambda,
     :protname,name_i,name_ii,pent,XDATA,x_i,UDATAx,UDATA,
     :xo,Wvals,NWVALS,ntyp,ntyx) 
       real dist(n_pri),pri_order(NNODES)
       real dilt(nnodes,nwvals),support(n_pri),degree(NNODES)
       real prize(nnodes,nwvals)
       real penalty(nnodes,nwvals),prio_const,prio_gamma
       character protna(nnodes)*11
       include "common.bp2"
              include "common.main"
              prio_const=1
              prio_gamma=1.2
              open(77,file='prio.txt')
              open(78,file="degrees_combined.tsv")
       do i=1,nnodes
       read(78,*)protna(i)!,pri_order(i)
c       print*,protna(i),pri_order(i)
c       support(i)=1
       pri_order(i)=1
       enddo       
       do i=1,n_pri
       read(77,*)pri1(i),dist(i),pri2(i),priv(i),support(i)
c       print*,pri1(i),dist(i),pri2(i),priv(i),support(i)
       enddo     
         do mu=1,NEXPTS
         do k=1,NNODES
         if(k.lt.TARGET_NODE)then
          x_i(k,mu)=XDATA(k,mu)
          name_i(k)=protname(k)
          name_ii(k,TARGET_NODE)=name_i(k)
          ntyx(k)=ntyp(k)
          endif
           if(k.gt.TARGET_NODE)then
          x_i(k-1,mu)=XDATA(k,mu)
          name_i(k-1)=protname(k)
          name_ii(k-1,TARGET_NODE)=name_i(k-1)
          ntyx(k-1)=ntyp(k)
          endif    
          enddo 
         xo(mu)=XDATA(TARGET_NODE,mu)
         UDATAx(mu)=UDATA(TARGET_NODE,mu)
        enddo
        
cccccccccccccccccccccccccccccccccccc
c define dilution penalty        
        do k=1,NWVALS
        do ii=1,NNODES-1
        if(Wvals(k).eq.0)then
        dilt(ii,k)=0
        else
        dilt(ii,k)=1
        endif
c       increase complexity of edges to phenotypes 
c        if(ntyx(ii).eq.2) dilt(ii,k)=0.5*dilt(ii,k)
       if(ntyp(TARGET_NODE).eq.2) dilt(ii,k)=0.5*dilt(ii,k)
c      if(Wvals(k).eq.0)then
c      penalty(ii,k)=0
c      else
c      if(pri_order(TARGET_NODE).gt.0.and.
c     :pri_order(TARGET_NODE).lt.(NNODES-1))then 
c      PENALTY(II,K)=(PRIO_CONST/(NNODES-1-pri_order(TARGET_NODE)))      
c     :*prio_gamma*
c     :log((degree(TARGET_NODE)+1)/degree(TARGET_NODE)+1) 
c      else
c       penalty(ii,k)=0
c      endif   
c      endif
      prize(ii,k)=0
cccccccccccccccccccccccccc
c define prior information        
         do iii=1,n_pri
      if(trim(adjustl(protname(TARGET_NODE))).
     :eq.trim(adjustl(pri2(iii))).and.
     :trim(adjustl(name_i(ii))).eq.trim(adjustl(pri1(iii))))then
c       print*,pri1(iii),pri2(iii),pri_ORDER(TARGET_NODE)
C      PRINT*,"HOOOP",III,protname(TARGET_NODE),TARGET_NODE
c     if priv=1 -> prior activating edge, 
c                  no dilution penalty for (+) Wij
c     priv=-1 ->  prior inhibitory edge
c                 no dilution penalty for (-) Wij
c     if priv=0 -> generic prior information for interaction (no
c                  preference for activation vs deactivation) and 
c                  no dilution penalty for both (+) and (-) Wij

         if(priv(iii).eq.1.and.Wvals(k).gt.0)then
         
      prize(ii,k)=
     :(1/pri_order(TARGET_NODE))*support(iii)
     
c      penalty(ii,k)=0	!update penalty to zero
         endif
         
         if(priv(iii).eq.-1.and.Wvals(k).lt.0)then
              prize(ii,k)= 
     :(prio_const/pri_order(TARGET_NODE))*support(iii)
c              penalty(ii,k)=0 !update penalty to zero
         endif
         
         if(priv(iii).eq.0.and.Wvals(k).ne.0)then
            prize(ii,k)=    
     :(1/pri_order(TARGET_NODE))*support(iii)
c         penalty(ii,k)=0	!update penalty to zero
         endif
         else
      endif
         enddo
         enddo
         enddo
        do k=1,NWVALS
        do ii=1,NNODES-1
        
        pent(ii,k)=0
        pent(ii,k)=exp(LAMBDA*(-dilt(ii,k)+prize(ii,k)))
c        if(TARGET_NODE.eq.80)then
c        print*,dilt(ii,k),prize(ii,k),pri_order(target_node)
c        endif
c      write(12345,*)
c     :name_i(ii),protname(TARGET_NODE),prize(ii,k),penalty(ii,k)
c    :,pent(ii,k),k
c       if(prize(ii,k).ne.0)
c     :print*,+prize(ii,k),-penalty(ii,k),ii,target_node
        enddo
        enddo
        CLOSE(77)
        CLOSE(78)
      end     
cccccccccccccccccccccccccccccccccccccccccccccc
cccccccccccccccccccccccccccccccccccccccccccccc      
      subroutine rhoupdate
     :(hmean_ij,stddev_ij,jp,Wvals,x_i,xo,alb,
     :UDATAx,beta,rho,TotalField,nnodes,NWVALS,myperm2,TARGET_NODE,
     :rho_tm1,nexpts)
      integer ii,jp
      include "common.bp2"
             include "common.main"
      n_var=nnodes-1
      do i=1,n_var
      do k=1,NWVALS
      ii=myperm2(i)

      delta=hmean_ij(II,Jp)+Wvals(k)*x_i(Ii,Jp)-
     :(atanh(xo(jp)*alb(TARGET_NODE))-UDATAx(jp))
      udbss = 2d0*beta*(stddev_ij(Ii,jp))+1d0
      rho(ii,jp,k) = exp(-beta *delta*delta/udbss)
      adj(ii,k)=(rho(ii,jp,k))/(rho_tm1(ii,jp,k))
      TotalField(ii,k)=TotalField(ii,k)*adj(ii,k)
c      if(TARGET_NODE.eq.80)then
c      print*,TotalField(ii,k),
c     :stddev_ij(Ii,jp),x_i(Ii,Jp),hmean_ij(II,Jp)
c      endif
      enddo
      enddo
      end
      subroutine prep_cg(n_node,n_Exp,round,wij,alb,n_obs)
c      use modoptions  
      character index*100,char1,options*100,topology*100
      double precision alb(n_node)
      real wij(n_node,n_node),gamma(n_node)
      integer topo(n_node,n_node),n_node,n_exp,numze,round,n_obs
c      write a temporary command file
  

       write(index,*)round
        
c      write the options file
c       open(2,file="inp_cg.txt")
       open(3,file="options_"//trim(adjustl(index))//".txt")
       open(4,file="topology_"//trim(adjustl(index))//".txt")
       options="options_"//trim(adjustl(index))//".txt"
       topology="topology_"//trim(adjustl(index))//".txt"
c       read(2,*)opt_resultpath
c       write(3,*)opt_resultpath
c       read(2,*)opt_sigmoid_type
c       write(3,"(i1)")opt_sigmoid_type
c       read(2,*)opt_VM
c       write(3,"(F8.6)")opt_VM       
c       read(2,*)opt_lambda
c       write(3,"(F8.6)")opt_lambda      
c       read(2,*)opt_eta
c       write(3,"(E12.6)")opt_eta       
c       read(2,*)opt_momentum
c       write(3,"(F8.6)")opt_momentum       
c       read(2,*)opt_iterations
c       write(3,"(i3)")opt_iterations       
c       read(2,*)opt_termination_threshold
c       write(3,"(F8.6)")opt_termination_threshold       
c       read(2,*)opt_L1
c       write(3,"(F8.6)")opt_L1
     
       do i=1,n_node
        write(3,*)(wij(j,i),j=1,n_node)
       enddo
       
       do i=1,n_node
       write(3,*)1.0000
       enddo
       
       do i=1,n_node
       gamma(i)=1/alb(i)
       write(3,*)gamma(i)
       enddo
       numze=0
       do i=1,n_node
        do j=1,n_node
        if(wij(i,j).eq.0)then
        topo(i,j)=0
        else
        topo(i,j)=1
        numze=numze+1  
        endif
      enddo
      enddo
      
      do i=1,n_node
      write(4,*)(topo(j,i),j=1,n_node)
      enddo
c       open(1,file="command.txt")
c       write(1,"(i4)")n_node
c       write(1,"(i4)")n_exp
c       write(1,*)"data_x.txt"
c       write(1,*)"data_u.txt"
c       write(1,*)"data_o.txt"
c       write(1,*)trim(adjustl(topology))
c       write(1,*)trim(adjustl(options))
c       write(1,"(i5)")round
c       write(1,"(i4)")numze
c       write(1,"(i4)")n_obs
       
      
      close(4)
      close(3)
c      close(2)
c      close(1)
      end             
