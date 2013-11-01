	<div id="admin-side-mbox-billing-info-dv" class="admin-side-mbox-dv">
<?php if ( empty($billing_info) ) : ?>
		<div class="clearfix">
			<?php _e( 'There is no billing info for this transaction.', 'event_espresso' );?><br/>
		</div>
<?php else : 
		foreach ( $billing_info as $item => $props ) :
			$value = $props['sanitize'] == 'ccard' ? substr( $props['value'], 0, 4 ) . 'XXXX XXXX ' . substr( $props['value'], -4 ) : $props['value'];
			$value = $props['sanitize'] == 'ccv' ? 'XXX' : $props['value'];
			?>

		<div class="clearfix">
			<span class="admin-side-mbox-label-spn lt-grey-txt float-left"><?php echo $props['label'];?></span><?php echo $value;?>
		</div>
		
		<?php endforeach; ?>

<?php endif; ?>	

	</div>

